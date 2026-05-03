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

const QuestionDetail = () => {
  const params = useParams();
  const postId = Number(params.postId);
  const { getPost, getAnswers, isPostLoading, isAnswerLoading, error } = usePostService();
  const [question, setQuestion] = useState<QuestionPost | null>(null);
  const [answers, setAnswers] = useState<AnswerPost[]>([]);

  const stored = localStorage.getItem("user-storage");
  const userId = stored ? JSON.parse(stored)?.state?.user?.userId : null;

  const isMyQuestion = userId !== null && question?.writer.userId === userId;
  const isWeb3Executable = question?.question.web3Execution.resource.status !== "COMPLETED";
  const isEditable = isMyQuestion && question?.commentCount === 0 && question?.question.web3Execution.resource.status === "COMPLETED";
  const canAcceptAnswer = isMyQuestion && !question?.question.isSolved;

  useEffect(() => {
    const fetchData = async () => {
      const [qData, aData] = await Promise.all([getPost(postId), getAnswers(postId)]);
      if (qData) setQuestion(qData as QuestionPost);
      if (aData) setAnswers(aData as AnswerPost[]);
    }
    fetchData();
  }, [getPost, getAnswers, postId]);

  if (isPostLoading) {
    return (
      <div className="w-full h-full flex min-h-screen justify-center items-center py-10">
        <LoadingSpinner size="lg" color="text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col min-h-screen justify-center items-center py-10">
        <p className="text-black-500">{"오류가 발생했습니다 : "}</p>
        <p className="text-black-500 whitespace-pre-line">{error}</p>
      </div>
    );
  }

  if(!question){
    return (
      <div className="w-full h-full flex flex-col min-h-screen justify-center items-center py-10">
        <p className="text-black-500">{"오류가 발생했습니다 : "}</p>
        <p className="text-black-500 whitespace-pre-line">{"게시물을 찾을 수 없습니다."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <QuestionHeader
        type="QUESTION"
        postId={Number(params.postId)}
        writer={question.writer}
        createdAt={question.createdAt}
        isEditable={isEditable}
        isWeb3Executable={isWeb3Executable}
        Web3Execution={question.question.web3Execution}
      />

      <div className="flex flex-col gap-3 pt-[72px]">
        <Question post={question} />

        <div className="pt-3 px-3 font-bold text-xl">
          답변 {question.commentCount}개
        </div>

        {isAnswerLoading ? (
          <div className="py-10">
            <LoadingSpinner size="md" color="text-gray-400" label="답변을 가져오는 중..." />
          </div>
        ) : (
          answers.length === 0 ? (
            <div className="py-10">
              <p className="text-center text-gray-600">아직 등록된 답변이 없습니다.</p>
            </div>
          ) : (
            answers.map((answer) => (
              <div key={answer.answerId}>
                <Answer answer={answer} isSelectable={canAcceptAnswer} />
              </div>
            ))
          )
        )}
      </div>

      {!isMyQuestion && <CreatePostButton postId={Number(params.postId)} />}
    </div>
  );
};

export default QuestionDetail;
