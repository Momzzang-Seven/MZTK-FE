import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import type { StoredWeb3Action } from "@types";
import { usePostService } from "@hooks";
import { getIntentStatusMessage } from "@utils";

const LocalPosts = () => {
  const navigate = useNavigate();
  const [pendingActions, setPendingActions] = useState<StoredWeb3Action[]>([]);
  const { refreshPendingPosts } = usePostService();

  useEffect(() => {
    refreshPendingPosts();

    const data = localStorage.getItem("pendingWeb3Actions");
    if (data) {
      setPendingActions(JSON.parse(data));
    }
  }, [refreshPendingPosts]);

  const handleExecute = async (intent: StoredWeb3Action) => {
    navigate(`/verify-wallet/${intent.resource.type}/${intent.resource.id}`, {
      state: { intent },
    });
  };

  return (
    <div className="pt-20">
      <SimpleHeader
        button={
          <img
            src="/icon/refreshB.svg"
            alt="refresh"
            onClick={refreshPendingPosts}
            className="w-5 h-5 cursor-pointer"
          />
        }
      />

      {pendingActions.length === 0 ? (
        <p className="text-gray-500">대기 중인 복구 작업이 없습니다.</p>
      ) : (
        <ul className="space-y-3 p-4">
          {pendingActions.map((intent, index) => (
            <li
              key={`${intent.executionIntent.id}-${index}`}
              className="border rounded-lg p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {intent.resource.type === "QUESTION" ? "질문" : "답변"}
                  </span>
                  <span
                    className={`text-xs font-medium ${intent.executionIntent.status === "AWAITING_SIGNATURE" ? "text-red-500" : "text-gray-500"}`}
                  >
                    {getIntentStatusMessage(intent.executionIntent.status)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                  {intent.summary}
                </p>
              </div>

              <button
                onClick={() => handleExecute(intent)}
                className="px-3 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
              >
                서명하기
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocalPosts;
