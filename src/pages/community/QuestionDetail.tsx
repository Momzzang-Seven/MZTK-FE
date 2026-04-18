import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { QuestionPost, AnswerPost } from "@types";
import {
  QuestionHeader,
  Question,
  Answer,
  CreatePostButton,
} from "@components/community";

const QuestionDetail = () => {
  const params = useParams();
  const [question, setQuestion] = useState<QuestionPost | null>(null);
  const [answers, setAnswers] = useState<AnswerPost[]>([]);

  useEffect(() => {
    fetch("/data/question.json")
      .then((res) => res.json())
      .then(setQuestion)
      .catch(console.error);

    fetch("/data/answers.json")
      .then((res) => res.json())
      .then(setAnswers)
      .catch(console.error);
  }, []);

  if (!question) return;

  const stored = localStorage.getItem("user-storage");
  const userId = stored ? JSON.parse(stored)?.state?.user?.userId : null;

  const isMyQuestion = userId !== null && question.writer.userId === userId;
  const canAcceptAnswer = isMyQuestion && !question.question.isSolved;

  return (
    <div className="h-full bg-gray-100">
      <QuestionHeader
        type="QUESTION"
        postId={Number(params.postId)}
        writer={question.writer}
        createdAt={question.createdAt}
      />

      <div className="flex flex-col gap-3 pt-[72px]">
        <Question post={question} />

        <div className="pt-3 px-3 font-bold text-xl">
          답변 {question.commentCount}개
        </div>

        {answers.length > 0 &&
          answers.map((answer) => (
            <div key={answer.answerId}>
              <Answer answer={answer} isSelectable={canAcceptAnswer} />
            </div>
          ))}
      </div>

      <CreatePostButton postId={Number(params.postId)} />
    </div>
  );
};

export default QuestionDetail;
