import { ethers, type Log } from "ethers";
import { getNetworkConfig } from "@utils";

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");
const DEFAULT_TRANSFER_LOOKBACK_BLOCKS = 500;
const DEFAULT_LOG_BLOCK_RANGE = 100;

export interface OnchainTokenTransfer {
  hash: string;
  to: string;
  from: string;
  value: string;
  timeStamp: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

export interface WalletBalanceSnapshot {
  ethBalance: string;
  tokenBalance: string;
}

export class OnchainRateLimitError extends Error {
  readonly cause?: unknown;

  constructor(cause?: unknown) {
    super("토큰 전송 내역을 불러오는 중 RPC 요청 한도를 초과했습니다.");
    this.name = "OnchainRateLimitError";
    this.cause = cause;
  }
}

const topicAddress = (address: string) =>
  ethers.zeroPadValue(ethers.getAddress(address), 32).toLowerCase();

const addressFromTopic = (topic: string) =>
  ethers.getAddress(`0x${topic.slice(-40)}`);

const createProvider = () => {
  const { RPC_URL } = getNetworkConfig();
  if (!RPC_URL) {
    throw new Error("RPC URL이 설정되지 않았습니다.");
  }
  return new ethers.JsonRpcProvider(RPC_URL);
};

const readPositiveIntegerEnv = (
  value: string | undefined,
  fallback: number
) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getTransferLookbackBlocks = () =>
  readPositiveIntegerEnv(
    import.meta.env.VITE_TOKEN_TRANSFER_LOOKBACK_BLOCKS as string | undefined,
    DEFAULT_TRANSFER_LOOKBACK_BLOCKS
  );

const getLogBlockRange = () =>
  readPositiveIntegerEnv(
    import.meta.env.VITE_RPC_LOG_BLOCK_RANGE as string | undefined,
    DEFAULT_LOG_BLOCK_RANGE
  );

type JsonRpcProvider = ReturnType<typeof createProvider>;

interface TransferLogFilter {
  address: string;
  fromBlock: number;
  toBlock: number;
  topics: (string | null)[];
}

const stringifyRpcError = (error: unknown): string => {
  if (!error || typeof error !== "object") return String(error);

  const parts = [String(error)];
  const record = error as Record<string, unknown>;

  ["name", "message", "code", "shortMessage", "reason"].forEach((key) => {
    const value = record[key];
    if (value !== undefined) parts.push(String(value));
  });

  ["error", "payload", "info"].forEach((key) => {
    const value = record[key];
    if (value === undefined) return;

    try {
      parts.push(JSON.stringify(value));
    } catch {
      parts.push(String(value));
    }
  });

  return parts.join(" ");
};

const isRpcRateLimitError = (error: unknown) => {
  const text = stringifyRpcError(error).toLowerCase();

  return (
    text.includes("429") ||
    text.includes("rate limit") ||
    text.includes("too many requests") ||
    text.includes("compute units per second")
  );
};

const isLogRangeTooWideError = (error: unknown) => {
  const text = stringifyRpcError(error).toLowerCase();

  return (
    text.includes("block range") ||
    text.includes("too many results") ||
    text.includes("query returned more than") ||
    text.includes("response size")
  );
};

export const isTokenTransferRateLimitError = (error: unknown) =>
  error instanceof OnchainRateLimitError || isRpcRateLimitError(error);

const getLogsWithAdaptiveRange = async (
  provider: JsonRpcProvider,
  filter: TransferLogFilter
): Promise<Log[]> => {
  try {
    return await provider.getLogs(filter);
  } catch (error) {
    if (error instanceof OnchainRateLimitError) {
      throw error;
    }

    if (isRpcRateLimitError(error)) {
      throw new OnchainRateLimitError(error);
    }

    if (filter.fromBlock >= filter.toBlock || !isLogRangeTooWideError(error)) {
      throw error;
    }

    const midpoint = Math.floor((filter.fromBlock + filter.toBlock) / 2);
    const left = await getLogsWithAdaptiveRange(provider, {
      ...filter,
      toBlock: midpoint,
    });
    const right = await getLogsWithAdaptiveRange(provider, {
      ...filter,
      fromBlock: midpoint + 1,
    });

    return [...left, ...right];
  }
};

const fetchTransferLogsForChunk = async (
  provider: JsonRpcProvider,
  tokenAddress: string,
  walletTopic: string,
  fromBlock: number,
  toBlock: number
) => {
  const incoming = await getLogsWithAdaptiveRange(provider, {
    address: tokenAddress,
    fromBlock,
    toBlock,
    topics: [TRANSFER_TOPIC, null, walletTopic],
  });
  const outgoing = await getLogsWithAdaptiveRange(provider, {
    address: tokenAddress,
    fromBlock,
    toBlock,
    topics: [TRANSFER_TOPIC, walletTopic],
  });

  return [...incoming, ...outgoing];
};

export const fetchWalletBalanceSnapshot = async (
  walletAddress: string
): Promise<WalletBalanceSnapshot> => {
  const { TOKEN_ADDRESS } = getNetworkConfig();
  if (!walletAddress || !TOKEN_ADDRESS) {
    return { ethBalance: "0", tokenBalance: "0" };
  }

  const provider = createProvider();
  const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
  const [ethWei, tokenRaw, decimals] = await Promise.all([
    provider.getBalance(walletAddress),
    token.balanceOf(walletAddress) as Promise<bigint>,
    token.decimals().catch(() => 18) as Promise<number>,
  ]);

  return {
    ethBalance: Number(ethers.formatEther(ethWei)).toLocaleString(undefined, {
      maximumFractionDigits: 4,
    }),
    tokenBalance: Number(
      ethers.formatUnits(tokenRaw, decimals)
    ).toLocaleString(),
  };
};

export const fetchTokenTransfers = async (
  walletAddress: string,
  limit = 100
): Promise<OnchainTokenTransfer[]> => {
  try {
    const { TOKEN_ADDRESS } = getNetworkConfig();
    if (!walletAddress || !TOKEN_ADDRESS || limit <= 0) return [];

    const provider = createProvider();
    const normalizedWallet = ethers.getAddress(walletAddress);
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(latestBlock - getTransferLookbackBlocks(), 0);
    const blockRange = getLogBlockRange();
    const walletTopic = topicAddress(normalizedWallet);
    const transferLogsByKey = new Map<string, Log>();

    for (
      let chunkToBlock = latestBlock;
      chunkToBlock >= fromBlock && transferLogsByKey.size < limit;
      chunkToBlock -= blockRange
    ) {
      const chunkFromBlock = Math.max(chunkToBlock - blockRange + 1, fromBlock);
      const chunkLogs = await fetchTransferLogsForChunk(
        provider,
        TOKEN_ADDRESS,
        walletTopic,
        chunkFromBlock,
        chunkToBlock
      );

      chunkLogs.forEach((log) => {
        transferLogsByKey.set(`${log.transactionHash}-${log.index}`, log);
      });
    }

    const deduped = Array.from(transferLogsByKey.values())
      .sort(
        (a, b) =>
          b.blockNumber - a.blockNumber || (b.index ?? 0) - (a.index ?? 0)
      )
      .slice(0, limit);

    const blockNumbers = Array.from(
      new Set(deduped.map((log) => log.blockNumber))
    );
    const blocks = await Promise.all(
      blockNumbers.map((blockNumber) => provider.getBlock(blockNumber))
    );
    const timestampByBlock = new Map(
      blocks
        .filter((block): block is NonNullable<typeof block> => block !== null)
        .map((block) => [block.number, block.timestamp])
    );

    return deduped.map((log) => ({
      hash: log.transactionHash,
      from: addressFromTopic(log.topics[1] ?? ethers.ZeroHash),
      to: addressFromTopic(log.topics[2] ?? ethers.ZeroHash),
      value: BigInt(log.data).toString(),
      timeStamp: String(timestampByBlock.get(log.blockNumber) ?? 0),
      tokenSymbol: "MZTK",
      tokenDecimal: "18",
    }));
  } catch (error) {
    if (error instanceof OnchainRateLimitError) {
      throw error;
    }

    if (isRpcRateLimitError(error)) {
      throw new OnchainRateLimitError(error);
    }

    throw error;
  }
};
