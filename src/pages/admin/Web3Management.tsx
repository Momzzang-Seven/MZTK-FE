import { useCallback, useEffect, useState } from "react";
import { Activity, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { useAdminStore, useUserStore, useConfirmModalStore } from "@store";
import { CommonButton } from "@components/common";
import { ADMIN_TEXT } from "@constant/admin";
import type {
  MarkTransactionSucceededRequest,
  ProvisionKeyRequest,
  SponsorNonceSlotDto,
  TreasuryRole,
} from "@types";
import { getNetworkConfig } from "@utils";
import { fetchSponsorNonceSlots } from "@services";

const TREASURY_ROLE_OPTIONS: Array<{ value: TreasuryRole; label: string }> = [
  { value: "REWARD", label: "REWARD - reward treasury" },
  { value: "SPONSOR", label: "SPONSOR - gas sponsor" },
  { value: "QNA_SIGNER", label: "QNA_SIGNER - QnA server signer" },
  {
    value: "MARKETPLACE_SIGNER",
    label: "MARKETPLACE_SIGNER - marketplace signer",
  },
];

const createDefaultManualTx = (): MarkTransactionSucceededRequest => ({
  txHash: "",
  explorerUrl: "",
  reason: "Operator manually confirmed the transaction.",
  evidence: "Receipt and business outcome were verified by operator.",
});

const severityClass = (slot: SponsorNonceSlotDto) => {
  if (slot.severity === "BLOCKING" || slot.blocking) {
    return "bg-red-50 text-red-600 border-red-100";
  }
  if (slot.severity === "WARNING") {
    return "bg-orange-50 text-orange-600 border-orange-100";
  }
  return "bg-blue-50 text-blue-600 border-blue-100";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const Web3Management = () => {
  const {
    confirmTransaction,
    treasuryKeys,
    fetchTreasuryKeys,
    disableKey,
    archiveKey,
    provisionKey,
  } = useAdminStore();
  const { showSnackbar } = useUserStore();
  const { openConfirm } = useConfirmModalStore();

  const [txId, setTxId] = useState("");
  const [manualTx, setManualTx] = useState<MarkTransactionSucceededRequest>(
    createDefaultManualTx
  );
  const [isLoading, setIsLoading] = useState(false);

  const [nonceSlots, setNonceSlots] = useState<SponsorNonceSlotDto[]>([]);
  const [fetching, setFetching] = useState(false);
  const [isPollingSuspended, setIsPollingSuspended] = useState(false);

  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionData, setProvisionData] = useState<ProvisionKeyRequest>({
    rawPrivateKey: "",
    role: "REWARD",
    expectedAddress: "",
  });
  const [isProvisioning, setIsProvisioning] = useState(false);

  const MONITOR_ADDRESS =
    import.meta.env.VITE_MONITOR_TARGET_ADDRESS ||
    import.meta.env.VITE_ADMIN_ADDRESS;
  const { CHAIN_ID, EXPLORER_TX_URL, NAME } = getNetworkConfig();

  const suggestExplorerUrl = useCallback(
    (hash: string) => (hash.trim() ? `${EXPLORER_TX_URL}${hash.trim()}` : ""),
    [EXPLORER_TX_URL]
  );

  const updateTxHash = (value: string) => {
    setManualTx((prev) => {
      const previousSuggestion = suggestExplorerUrl(prev.txHash);
      const shouldReplaceExplorer =
        !prev.explorerUrl || prev.explorerUrl === previousSuggestion;
      return {
        ...prev,
        txHash: value,
        explorerUrl: shouldReplaceExplorer
          ? suggestExplorerUrl(value)
          : prev.explorerUrl,
      };
    });
  };

  const fetchWalletActivity = useCallback(async () => {
    if (!MONITOR_ADDRESS || !CHAIN_ID) {
      setNonceSlots([]);
      return;
    }

    setFetching(true);
    try {
      const response = await fetchSponsorNonceSlots({
        chainId: CHAIN_ID,
        fromAddress: MONITOR_ADDRESS,
        page: 0,
        size: 10,
      });
      setNonceSlots(response.slots ?? []);
    } catch (error) {
      console.error("Failed to fetch nonce-slot activity:", error);
      setNonceSlots([]);
      setIsPollingSuspended(true);
    } finally {
      setFetching(false);
    }
  }, [CHAIN_ID, MONITOR_ADDRESS]);

  useEffect(() => {
    void fetchTreasuryKeys();
  }, [fetchTreasuryKeys]);

  useEffect(() => {
    if (isPollingSuspended) return;

    void fetchWalletActivity();
    const interval = setInterval(() => {
      void fetchWalletActivity();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchWalletActivity, isPollingSuspended]);

  const handleConfirm = (id?: number) => {
    const targetId = id ?? Number(txId);
    if (
      !targetId ||
      !manualTx.txHash.trim() ||
      !manualTx.explorerUrl.trim() ||
      !manualTx.reason.trim() ||
      !manualTx.evidence.trim()
    ) {
      return;
    }

    openConfirm({
      title: "Manual Transaction Confirmation",
      message: `DB transaction #${targetId} will be marked as succeeded.`,
      variant: "warning",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await confirmTransaction(targetId, manualTx);
          showSnackbar(ADMIN_TEXT.WEB3.MSG_CONFIRM_SUCCESS);
          setTxId("");
          setManualTx(createDefaultManualTx());
          void fetchWalletActivity();
        } catch {
          showSnackbar(ADMIN_TEXT.WEB3.MSG_CONFIRM_FAILED);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleDisableKey = (alias: string) => {
    openConfirm({
      title: "Disable Treasury Key",
      message: ADMIN_TEXT.WEB3.TREASURY.CONFIRM_DISABLE.replace(
        "%ALIAS%",
        alias
      ),
      variant: "warning",
      onConfirm: async () => {
        try {
          await disableKey(alias);
          showSnackbar(ADMIN_TEXT.WEB3.TREASURY.MSG_DISABLE_SUCCESS);
        } catch {
          showSnackbar(ADMIN_TEXT.WEB3.TREASURY.MSG_FAILED);
        }
      },
    });
  };

  const handleArchiveKey = (alias: string) => {
    openConfirm({
      title: "Archive Treasury Key",
      message: ADMIN_TEXT.WEB3.TREASURY.CONFIRM_ARCHIVE.replace(
        "%ALIAS%",
        alias
      ),
      variant: "error",
      onConfirm: async () => {
        try {
          await archiveKey(alias);
          showSnackbar(ADMIN_TEXT.WEB3.TREASURY.MSG_ARCHIVE_SUCCESS);
        } catch {
          showSnackbar(ADMIN_TEXT.WEB3.TREASURY.MSG_FAILED);
        }
      },
    });
  };

  const handleProvisionKey = async () => {
    setIsProvisioning(true);
    try {
      await provisionKey(provisionData);
      showSnackbar(ADMIN_TEXT.WEB3.MODAL.MSG_SUCCESS);
      setShowProvisionModal(false);
      setProvisionData({
        rawPrivateKey: "",
        role: "REWARD",
        expectedAddress: "",
      });
    } catch {
      showSnackbar(ADMIN_TEXT.WEB3.MODAL.MSG_FAILED);
    } finally {
      setIsProvisioning(false);
    }
  };

  const manualConfirmDisabled =
    isLoading ||
    !txId ||
    !manualTx.txHash.trim() ||
    !manualTx.explorerUrl.trim() ||
    !manualTx.reason.trim() ||
    !manualTx.evidence.trim();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {ADMIN_TEXT.WEB3.TITLE}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-50 text-blue-600 border border-blue-100">
              {NAME}
            </span>
            <p className="text-[10px] text-gray-400 font-medium">
              Monitor wallet: {MONITOR_ADDRESS || "not configured"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsPollingSuspended(false);
            void fetchWalletActivity();
          }}
          className="p-2 rounded-lg transition-all hover:bg-gray-100 disabled:opacity-50"
          disabled={fetching}
          aria-label="Refresh nonce slots"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-400 ${fetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Manual Transaction Confirmation
          </h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Enter the backend DB transaction ID and the on-chain transaction
            evidence separately.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                DB Transaction ID
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                placeholder="Internal DB id"
                value={txId}
                onChange={(event) => setTxId(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                On-chain TX Hash
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                placeholder="0x..."
                value={manualTx.txHash}
                onChange={(event) => updateTxHash(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Explorer URL
              </label>
              <input
                type="url"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                placeholder={`${EXPLORER_TX_URL}0x...`}
                value={manualTx.explorerUrl}
                onChange={(event) =>
                  setManualTx((prev) => ({
                    ...prev,
                    explorerUrl: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reason
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                value={manualTx.reason}
                onChange={(event) =>
                  setManualTx((prev) => ({
                    ...prev,
                    reason: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Evidence
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all min-h-24 resize-none"
                value={manualTx.evidence}
                onChange={(event) =>
                  setManualTx((prev) => ({
                    ...prev,
                    evidence: event.target.value,
                  }))
                }
              />
            </div>
            <CommonButton
              label={isLoading ? ADMIN_TEXT.COMMON.LOADING : "Mark Succeeded"}
              onClick={() => handleConfirm()}
              disabled={manualConfirmDisabled}
              className="w-full bg-main text-white py-4 rounded-2xl font-bold shadow-lg shadow-main/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            />
          </div>
        </div>

        <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Wallet Activity Monitoring
            </h3>
            <span
              className={`text-[10px] font-black px-3 py-1 rounded-full transition-all ${fetching ? "bg-blue-50 text-blue-500" : "bg-orange-50 text-main"}`}
            >
              {fetching ? ADMIN_TEXT.WEB3.MONITORING.FETCHING : "BE NONCE"}
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {nonceSlots.length > 0 ? (
              nonceSlots.map((slot) => {
                const displayTime =
                  slot.updatedAt ?? slot.lastBroadcastedAt ?? slot.createdAt;
                return (
                  <div
                    key={`${slot.nonce}-${slot.status}-${slot.activeTxId ?? "none"}`}
                    className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group"
                  >
                    <div className="flex gap-4 items-center overflow-hidden">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                          slot.blocking
                            ? "bg-red-50 text-red-500"
                            : "bg-white text-blue-500"
                        }`}
                      >
                        {slot.blocking ? (
                          <AlertTriangle size={20} />
                        ) : (
                          <Activity size={20} />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 text-sm">
                            Nonce #{slot.nonce}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded border font-black ${severityClass(slot)}`}
                          >
                            {slot.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-gray-400">
                            Updated: {formatDateTime(displayTime)}
                          </p>
                          {slot.activeTxId && (
                            <span className="text-[10px] text-main font-bold">
                              DB TX #{slot.activeTxId}
                            </span>
                          )}
                        </div>
                        {slot.displayReason && (
                          <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[520px]">
                            {slot.displayReason}
                          </p>
                        )}
                      </div>
                    </div>
                    {slot.activeTxHash ? (
                      <a
                        href={`${EXPLORER_TX_URL}${slot.activeTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-gray-400 hover:text-main px-3 py-2 rounded-lg transition-all shrink-0 flex items-center gap-1"
                      >
                        {ADMIN_TEXT.WEB3.MONITORING.DETAIL}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-300 font-bold shrink-0">
                        NO HASH
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <Activity className="text-gray-200" size={40} />
                <p className="text-gray-400 font-medium">
                  {isPollingSuspended
                    ? "Backend nonce monitoring is unavailable."
                    : ADMIN_TEXT.WEB3.MONITORING.EMPTY}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {ADMIN_TEXT.WEB3.TREASURY.TITLE}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {ADMIN_TEXT.WEB3.TREASURY.SUBTITLE}
            </p>
          </div>
          <CommonButton
            label={ADMIN_TEXT.WEB3.TREASURY.BTN_ADD}
            onClick={() => setShowProvisionModal(true)}
            className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {treasuryKeys.length > 0 ? (
            treasuryKeys.map((key) => (
              <div
                key={key.walletAlias}
                className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2">
                  <span
                    className={`text-[9px] font-black px-2 py-1 rounded ${
                      key.status === "ACTIVE"
                        ? "bg-green-50 text-green-500"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {key.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center font-black">
                    {key.role?.substring(0, 2) ?? "--"}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-gray-800 truncate">
                      {key.walletAlias}
                    </h4>
                    <p className="text-[10px] text-gray-400 truncate">
                      {key.walletAddress}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDisableKey(key.walletAlias)}
                    disabled={key.status !== "ACTIVE"}
                    className="flex-1 py-2 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-all disabled:opacity-30"
                  >
                    DISABLE
                  </button>
                  <button
                    onClick={() => handleArchiveKey(key.walletAlias)}
                    disabled={key.status === "ARCHIVED"}
                    className="flex-1 py-2 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-30"
                  >
                    ARCHIVE
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              <Activity className="text-gray-300 mb-3" size={36} />
              <p className="text-sm font-bold text-gray-700">
                {ADMIN_TEXT.WEB3.TREASURY.EMPTY}
              </p>
              <button
                onClick={() => void fetchTreasuryKeys()}
                className="mt-2 text-xs text-main font-bold hover:underline"
              >
                {ADMIN_TEXT.COMMON.SEARCH}
              </button>
            </div>
          )}
        </div>
      </div>

      {showProvisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-bold mb-6">
              {ADMIN_TEXT.WEB3.MODAL.TITLE}
            </h3>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {ADMIN_TEXT.WEB3.MODAL.LABEL_KEY}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                  placeholder={ADMIN_TEXT.WEB3.MODAL.PLACEHOLDER_KEY}
                  value={provisionData.rawPrivateKey}
                  onChange={(event) =>
                    setProvisionData({
                      ...provisionData,
                      rawPrivateKey: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {ADMIN_TEXT.WEB3.MODAL.LABEL_ROLE}
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                  value={provisionData.role}
                  onChange={(event) =>
                    setProvisionData({
                      ...provisionData,
                      role: event.target.value as TreasuryRole,
                    })
                  }
                >
                  {TREASURY_ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {ADMIN_TEXT.WEB3.MODAL.LABEL_ADDRESS}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                  placeholder="0x..."
                  value={provisionData.expectedAddress}
                  onChange={(event) =>
                    setProvisionData({
                      ...provisionData,
                      expectedAddress: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProvisionModal(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                {ADMIN_TEXT.WEB3.MODAL.BTN_CANCEL}
              </button>
              <button
                onClick={() => void handleProvisionKey()}
                disabled={
                  isProvisioning ||
                  !provisionData.rawPrivateKey ||
                  !provisionData.expectedAddress
                }
                className="flex-1 py-4 bg-main text-white rounded-2xl font-bold shadow-lg shadow-main/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isProvisioning
                  ? ADMIN_TEXT.COMMON.LOADING
                  : ADMIN_TEXT.WEB3.MODAL.BTN_CREATE}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Web3Management;
