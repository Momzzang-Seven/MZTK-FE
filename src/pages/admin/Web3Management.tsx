import { useEffect, useState } from "react";
import { useAdminStore, useUserStore, useConfirmModalStore } from "@store";
import { CommonButton } from "@components/common";
import { ADMIN_TEXT } from "@constant/admin";
import type { ProvisionKeyRequest } from "@types";
import { getNetworkConfig } from "@utils";
import { api } from "@services/client";

interface EtherscanTx {
  hash: string;
  to: string;
  from: string;
  value: string;
  timeStamp: string;
  txreceipt_status: string;
}

const Web3Management = () => {
  const {
    confirmTransaction,
    treasuryKeys,
    fetchTreasuryKeys,
    disableKey,
    archiveKey,
    selectedChainId,
    provisionKey,
  } = useAdminStore();
  const { showSnackbar } = useUserStore();
  const { openConfirm } = useConfirmModalStore();

  // Manual Confirmation State
  const [txId, setTxId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Monitoring State
  const [walletTxs, setWalletTxs] = useState<EtherscanTx[]>([]);
  const [fetching, setFetching] = useState(false);
  const [isPollingSuspended, setIsPollingSuspended] = useState(false);

  // Provision Key State
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
  const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
  const { ETHERSCAN_URL, EXPLORER_TX_URL } = getNetworkConfig();

  const fetchWalletActivity = async () => {
    if (!MONITOR_ADDRESS || isPollingSuspended) return;
    setFetching(true);
    try {
      const url = `${ETHERSCAN_URL}?chainid=${selectedChainId}&module=account&action=txlist&address=${MONITOR_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`;

      const res = await api.get(url);
      const data = res.data;

      if (data.status === "1") {
        setWalletTxs(data.result);
      } else {
        setWalletTxs([]);
      }
    } catch (error) {
      console.error("Failed to fetch wallet activity:", error);
      setWalletTxs([]);

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response: { status: number } }).response?.status >= 500
      ) {
        setIsPollingSuspended(true);
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isPollingSuspended) return;

    fetchWalletActivity();
    fetchTreasuryKeys();
    const interval = setInterval(() => {
      if (!isPollingSuspended) {
        fetchWalletActivity();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedChainId, isPollingSuspended]);

  const handleConfirm = (id?: number) => {
    const targetId = id || Number(txId);
    if (!targetId) return;

    openConfirm({
      title: "Transaction Confirmation",
      message: ADMIN_TEXT.WEB3.CONFIRM_TX.replace("%ID%", targetId.toString()),
      variant: "warning",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await confirmTransaction(targetId);
          showSnackbar(ADMIN_TEXT.WEB3.MSG_CONFIRM_SUCCESS);
          setTxId("");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {ADMIN_TEXT.WEB3.TITLE}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${selectedChainId === "11155420" ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}
            >
              {selectedChainId === "11155420"
                ? "Optimism Sepolia"
                : "Base Sepolia"}
            </span>
            <p className="text-[10px] text-gray-400 font-medium">
              Wallet: {MONITOR_ADDRESS}
            </p>
          </div>
        </div>
        <button
          onClick={fetchWalletActivity}
          className={`p-2 rounded-lg transition-all ${fetching ? "animate-spin opacity-50" : "hover:bg-gray-100"}`}
        >
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Manual Confirmation Card */}
        <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {ADMIN_TEXT.WEB3.MANUAL.TITLE}
          </h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {ADMIN_TEXT.WEB3.MANUAL.DESC}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                TX ID (DB ID)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                placeholder={ADMIN_TEXT.ACCOUNTS.MODAL.PLACEHOLDER_ID}
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
              />
            </div>
            <CommonButton
              label={
                isLoading
                  ? ADMIN_TEXT.COMMON.LOADING
                  : ADMIN_TEXT.WEB3.MANUAL.TITLE
              }
              onClick={() => handleConfirm()}
              disabled={isLoading || !txId}
              className="w-full bg-main text-white py-4 rounded-2xl font-bold shadow-lg shadow-main/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            />
          </div>
        </div>

        {/* Monitoring List */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              {ADMIN_TEXT.WEB3.MONITORING.TITLE}
            </h3>
            <span
              className={`text-[10px] font-black px-3 py-1 rounded-full transition-all ${fetching ? "bg-blue-50 text-blue-500" : "bg-orange-50 text-main"}`}
            >
              {fetching
                ? ADMIN_TEXT.WEB3.MONITORING.FETCHING
                : ADMIN_TEXT.WEB3.MONITORING.LIVE}
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {walletTxs.length > 0 ? (
              walletTxs.map((tx, idx) => {
                const isSuccess = tx.txreceipt_status === "1";
                return (
                  <div
                    key={tx.hash || idx}
                    className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group"
                  >
                    <div className="flex gap-4 items-center overflow-hidden">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isSuccess ? "bg-white" : "bg-orange-50 animate-pulse"}`}
                      >
                        {isSuccess ? (
                          <img
                            src="/icon/adminToken.svg"
                            className="w-6 h-6"
                            alt="token"
                          />
                        ) : (
                          <div
                            className="w-6 h-6 bg-main"
                            style={{
                              maskImage: "url(/icon/adminToken.svg)",
                              WebkitMaskImage: "url(/icon/adminToken.svg)",
                              maskRepeat: "no-repeat",
                              maskPosition: "center",
                              maskSize: "contain",
                            }}
                          />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 text-sm truncate max-w-[200px]">
                            {tx.hash}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-black ${tx.to.toLowerCase() === MONITOR_ADDRESS.toLowerCase() ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                          >
                            {tx.to.toLowerCase() ===
                            MONITOR_ADDRESS.toLowerCase()
                              ? "IN"
                              : "OUT"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-gray-400">
                            {new Date(
                              Number(tx.timeStamp) * 1000
                            ).toLocaleString()}
                          </p>
                          <span className="text-[10px] text-main font-bold">
                            {(Number(tx.value) / 1e18).toFixed(4)} ETH
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={`${EXPLORER_TX_URL}${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-gray-400 hover:text-main px-3 py-2 rounded-lg transition-all shrink-0"
                    >
                      {ADMIN_TEXT.WEB3.MONITORING.DETAIL}
                    </a>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <div className="text-4xl opacity-20">🔍</div>
                <p className="text-gray-400 font-medium">
                  {ADMIN_TEXT.WEB3.MONITORING.EMPTY}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Treasury Key Management Section */}
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
                    className={`text-[9px] font-black px-2 py-1 rounded ${key.status === "ACTIVE" ? "bg-green-50 text-green-500" : "bg-gray-100 text-gray-400"}`}
                  >
                    {key.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center font-black">
                    {key.role?.substring(0, 2)}
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
                    className="flex-1 py-2 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    ARCHIVE
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-xl">
                🗝️
              </div>
              <p className="text-sm font-bold text-gray-700">
                {ADMIN_TEXT.WEB3.TREASURY.EMPTY}
              </p>
              <button
                onClick={() => fetchTreasuryKeys()}
                className="mt-2 text-xs text-main font-bold hover:underline"
              >
                {ADMIN_TEXT.COMMON.SEARCH}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Provision Key Modal */}
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
                  onChange={(e) =>
                    setProvisionData({
                      ...provisionData,
                      rawPrivateKey: e.target.value,
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
                  onChange={(e) =>
                    setProvisionData({ ...provisionData, role: e.target.value })
                  }
                >
                  <option value="REWARD">REWARD (보상 지급)</option>
                  <option value="SETTLEMENT">SETTLEMENT (정산)</option>
                  <option value="FEE">FEE (수수료)</option>
                  <option value="RESERVE">RESERVE (예비)</option>
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
                  onChange={(e) =>
                    setProvisionData({
                      ...provisionData,
                      expectedAddress: e.target.value,
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
                onClick={handleProvisionKey}
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
