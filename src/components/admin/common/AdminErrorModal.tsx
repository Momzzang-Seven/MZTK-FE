import { useAdminErrorStore } from "@store";
import { X, AlertCircle, Terminal, Globe, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminErrorModal = () => {
  const navigate = useNavigate();
  const {
    isOpen,
    status,
    code,
    message,
    detail,
    url,
    method,
    closeErrorModal,
  } = useAdminErrorStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    // 1. 모달 상태를 즉시 닫음
    closeErrorModal();

    // 2. 대시보드로 안전하게 이동
    setTimeout(() => {
      navigate("/admin/dashboard");
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={closeErrorModal}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-red-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="bg-red-50 px-8 py-6 flex items-center justify-between border-b border-red-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-200">
              <AlertCircle size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                API 요청 실패
              </h3>
              <p className="text-red-500 text-[11px] font-black uppercase tracking-widest mt-0.5">
                관리자 오류 진단
              </p>
            </div>
          </div>
          <button
            onClick={closeErrorModal}
            className="p-2.5 rounded-xl hover:bg-red-100 text-red-400 hover:text-red-600 transition-all"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Main Message */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-black">
                {status}
              </span>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                {code}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800 leading-snug">
              {message}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Globe size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Endpoint
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-main bg-orange-50 px-1.5 py-0.5 rounded uppercase">
                  {method}
                </span>
                <span className="text-[12px] font-bold text-gray-700 truncate">
                  {url}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Terminal size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Timestamp
                </span>
              </div>
              <p className="text-[12px] font-bold text-gray-700">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Detail Trace (Response Value) */}
          {detail !== null && detail !== undefined && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                <ChevronRight size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Server Response Detail
                </span>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 overflow-x-auto max-h-[200px] custom-scrollbar shadow-inner">
                <pre className="text-[12px] font-mono text-emerald-400 leading-relaxed">
                  {JSON.stringify(detail, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 flex justify-end">
          <button
            onClick={handleConfirm}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
          >
            Confirm & Close
          </button>
        </div>
      </div>
    </div>
  );
};
