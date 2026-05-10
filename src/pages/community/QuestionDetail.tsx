import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "@components/common";
import type { QuestionPost, AnswerPost } from "@types";
import {
  QuestionHeader,
  Question,
  Answer,
  CreatePostButton,
} from "@components/community";
import { usePostService } from "@hooks";
import { useUserStore } from "@store";
import { MessageCircle } from "lucide-react";

const QuestionDetail = () => {
  const params = useParams();
  const postId = Number(params.postId);
  const { getPost, getAnswers, isPostLoading, isAnswerLoading, error } =
    usePostService();
  const [question, setQuestion] = useState<QuestionPost | null>(null);
  const [answers, setAnswers] = useState<AnswerPost[]>([]);

  const userId = useUserStore((s) => s.user?.userId);
  const isMine =
    userId !== undefined &&
    question?.writer.userId !== undefined &&
    Number(question.writer.userId) === Number(userId);
  const isWeb3Done =
    question?.publicationStatus === "VISIBLE" ||
    question?.publicationStatus === "FAILED";

  useEffect(() => {
    if (question) {
      console.log("[QuestionDetail] Current User ID:", userId);
      console.log(
        "[QuestionDetail] Question Writer ID:",
        question.writer.userId
      );
      console.log("[QuestionDetail] isMine:", isMine);
    }
  }, [userId, question, isMine]);

  const isWeb3Executable =
    isMine &&
    !isWeb3Done &&
    question?.question.web3Execution.executionIntent.status ===
      "AWAITING_SIGNATURE";
  const isEditable = isMine && isWeb3Done && question?.commentCount === 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qData, aData] = await Promise.all([
          getPost(postId),
          getAnswers(postId),
        ]);
        if (qData) setQuestion(qData as QuestionPost);
        if (aData) setAnswers(aData as AnswerPost[]);
        return { qData, aData };
      } catch (err) {
        console.error("Failed to fetch data:", err);
        return { qData: null, aData: [] };
      }
    };

    fetchData();

    // 5초마다 상태를 체크하여 자동 갱신
    const interval = setInterval(async () => {
      const { qData, aData } = await fetchData();

      // 질문과 모든 답변이 최종 상태(완료 혹은 실패)에 도달했는지 확인
      const isQuestionDone =
        qData?.publicationStatus === "VISIBLE" ||
        qData?.publicationStatus === "FAILED";

      const areAnswersDone = (aData as AnswerPost[])?.every(
        (a) =>
          a.web3Execution.resource.status === "COMPLETED" ||
          a.web3Execution.resource.status === "FAILED"
      );

      // 모든 작업이 완료되었다면 폴링 중단
      if (isQuestionDone && areAnswersDone) {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [getPost, getAnswers, postId]);

  if (isPostLoading && !question) {
    return (
      <div className="w-full h-full flex min-h-screen justify-center items-center bg-white">
        <LoadingSpinner size="lg" color="text-main" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col min-h-screen justify-center items-center py-10 px-6 text-center">
        <div className="bg-red-50 p-6 rounded-[32px] border border-red-100">
          <p className="text-red-500 font-black mb-2">오류가 발생했습니다</p>
          <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="w-full h-full flex flex-col min-h-screen justify-center items-center py-10">
        <p className="text-gray-400 font-bold">게시물을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <QuestionHeader
        isMine={isMine}
        type="QUESTION"
        postId={Number(params.postId)}
        writer={question.writer}
        createdAt={question.createdAt}
        isEditable={isEditable}
        isWeb3Executable={isWeb3Executable}
        Web3Execution={question.question.web3Execution}
      />

      <div className="flex flex-col pt-[88px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Question post={question} />

        <div className="px-5 py-6 flex items-center gap-2">
          <MessageCircle size={20} className="text-gray-400" strokeWidth={3} />
          <span className="text-[18px] font-black text-gray-900 tracking-tight">
            답변 {answers.length}
          </span>
        </div>

        <div className="flex flex-col gap-4 px-4">
          {isAnswerLoading && answers.length === 0 ? (
            <div className="py-20">
              <LoadingSpinner
                size="md"
                color="text-main"
                label="답변을 가져오는 중..."
              />
            </div>
          ) : answers.length === 0 ? (
            <div className="py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <MessageCircle size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-black tracking-tight">
                아직 등록된 답변이 없습니다.
              </p>
              <p className="text-gray-300 text-xs mt-1 font-medium">
                첫 번째 답변의 주인공이 되어보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => (
                <div
                  key={answer.answerId}
                  className="bg-white rounded-[32px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-100"
                >
                  <Answer
                    answer={answer}
                    parentId={postId}
                    isSelectable={Boolean(
                      isMine && isWeb3Done && !question.question.isSolved
                    )}
                    isEditable={
                      answer.userId === userId
                        ? !answer.isAccepted &&
                          answer.web3Execution.resource.status === "COMPLETED"
                        : false
                    }
                    isWeb3Executable={
                      answer.userId === userId &&
                      answer.web3Execution.resource.status !== "COMPLETED" &&
                      answer.web3Execution.executionIntent.status ===
                        "AWAITING_SIGNATURE"
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!isMine && <CreatePostButton postId={Number(params.postId)} />}
    </div>
  );
};

export default QuestionDetail;
