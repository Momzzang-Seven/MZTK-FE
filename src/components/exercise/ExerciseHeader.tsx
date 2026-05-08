import { EXERCISE_TEXT } from "@constant/exercise";

export const ExerciseHeader = () => {
  return (
    <h1 className="text-4xl font-bold text-left text-main mb-8">
      {EXERCISE_TEXT.TITLE}
    </h1>
  );
};
