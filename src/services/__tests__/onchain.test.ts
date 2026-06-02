import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const providerMocks = vi.hoisted(() => ({
  getBlockNumber: vi.fn(),
  getLogs: vi.fn(),
  getBlock: vi.fn(),
}));

const TOKEN_ADDRESS = "0xfd6c0dc7fbe6a200d53d00bbaa2a276d02865de8";
const WALLET_ADDRESS = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const OTHER_ADDRESS = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const TRANSFER_TOPIC = "0xtransfer";

const topicFor = (address: string) =>
  `0x${address.replace(/^0x/, "").toLowerCase().padStart(64, "0")}`;

vi.mock("ethers", () => ({
  ethers: {
    id: vi.fn(() => "0xtransfer"),
    zeroPadValue: vi.fn(
      (address: string) =>
        `0x${address.replace(/^0x/, "").toLowerCase().padStart(64, "0")}`
    ),
    getAddress: vi.fn((address: string) => {
      const rawAddress = address.replace(/^0x/, "").slice(-40).toLowerCase();
      return `0x${rawAddress}`;
    }),
    JsonRpcProvider: vi.fn(function JsonRpcProvider() {
      return providerMocks;
    }),
    Contract: vi.fn(),
    formatEther: vi.fn(),
    formatUnits: vi.fn(),
    ZeroHash: `0x${"0".repeat(64)}`,
  },
}));

const makeTransferLog = ({
  blockNumber,
  hash,
  index,
  from,
  to,
  value = 10n,
}: {
  blockNumber: number;
  hash: string;
  index: number;
  from: string;
  to: string;
  value?: bigint;
}) => ({
  blockNumber,
  transactionHash: hash,
  index,
  topics: [TRANSFER_TOPIC, topicFor(from), topicFor(to)],
  data: `0x${value.toString(16)}`,
});

describe("onchain token transfers", () => {
  let fetchTokenTransfers: typeof import("../onchain").fetchTokenTransfers;
  let OnchainRateLimitError: typeof import("../onchain").OnchainRateLimitError;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("VITE_BASE_SEPOLIA_RPC", "https://base.example");
    vi.stubEnv("VITE_BASE_SEPOLIA_CHAIN_ID", "84532");
    vi.stubEnv("VITE_BASE_SEPOLIA_TOKEN_ADDRESS", TOKEN_ADDRESS);
    const onchain = await import("../onchain");
    fetchTokenTransfers = onchain.fetchTokenTransfers;
    OnchainRateLimitError = onchain.OnchainRateLimitError;
    providerMocks.getBlockNumber.mockResolvedValue(125);
    providerMocks.getBlock.mockImplementation((blockNumber: number) =>
      Promise.resolve({ number: blockNumber, timestamp: blockNumber + 1000 })
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("queries logs in configured block chunks and stops once the limit is met", async () => {
    vi.stubEnv("VITE_TOKEN_TRANSFER_LOOKBACK_BLOCKS", "30");
    vi.stubEnv("VITE_RPC_LOG_BLOCK_RANGE", "10");
    providerMocks.getLogs.mockImplementation((filter) => {
      expect(filter.toBlock - filter.fromBlock + 1).toBeLessThanOrEqual(10);

      if (
        filter.fromBlock === 116 &&
        filter.toBlock === 125 &&
        filter.topics[1] === null
      ) {
        return Promise.resolve([
          makeTransferLog({
            blockNumber: 124,
            hash: "0xincoming",
            index: 0,
            from: OTHER_ADDRESS,
            to: WALLET_ADDRESS,
          }),
        ]);
      }

      return Promise.resolve([]);
    });

    const result = await fetchTokenTransfers(WALLET_ADDRESS, 1);

    expect(providerMocks.getLogs).toHaveBeenCalledTimes(2);
    expect(providerMocks.getBlock).toHaveBeenCalledWith(124);
    expect(result).toEqual([
      {
        hash: "0xincoming",
        from: OTHER_ADDRESS,
        to: WALLET_ADDRESS,
        value: "10",
        timeStamp: "1124",
        tokenSymbol: "MZTK",
        tokenDecimal: "18",
      },
    ]);
  });

  it("splits a chunk again when the RPC rejects a wide log range", async () => {
    vi.stubEnv("VITE_TOKEN_TRANSFER_LOOKBACK_BLOCKS", "12");
    vi.stubEnv("VITE_RPC_LOG_BLOCK_RANGE", "12");
    providerMocks.getLogs.mockImplementation((filter) => {
      const range = filter.toBlock - filter.fromBlock + 1;
      if (range > 5) {
        return Promise.reject(new Error("block range is too wide"));
      }
      return Promise.resolve([]);
    });

    await expect(fetchTokenTransfers(WALLET_ADDRESS, 10)).resolves.toEqual([]);

    expect(providerMocks.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        fromBlock: expect.any(Number),
        toBlock: expect.any(Number),
      })
    );
    expect(
      providerMocks.getLogs.mock.calls.some(([filter]) => {
        const range = filter.toBlock - filter.fromBlock + 1;
        return range <= 5;
      })
    ).toBe(true);
  });

  it("does not split log ranges when the RPC returns a rate limit", async () => {
    vi.stubEnv("VITE_TOKEN_TRANSFER_LOOKBACK_BLOCKS", "12");
    vi.stubEnv("VITE_RPC_LOG_BLOCK_RANGE", "12");
    providerMocks.getLogs.mockRejectedValue(
      Object.assign(new Error("Your app has exceeded its compute units"), {
        error: {
          code: 429,
          message: "compute units per second capacity exceeded",
        },
      })
    );

    await expect(
      fetchTokenTransfers(WALLET_ADDRESS, 10)
    ).rejects.toBeInstanceOf(OnchainRateLimitError);
    expect(providerMocks.getLogs).toHaveBeenCalledTimes(1);
  });
});
