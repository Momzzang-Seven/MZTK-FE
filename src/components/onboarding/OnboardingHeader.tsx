import { ONBOARDING_TEXT } from "@constant/onboarding";

export const OnboardingHeader = () => {
  return (
    <div className="flex flex-col mb-8">
      <h1 className="font-bold text-[28px] leading-tight text-black mb-4">
        {ONBOARDING_TEXT.TITLE_1} <br /> {ONBOARDING_TEXT.TITLE_2}
      </h1>
      <p className="text-color-grey-deep text-[16px] leading-relaxed">
        {ONBOARDING_TEXT.DESC_1} <br /> {ONBOARDING_TEXT.DESC_2}
        <br />
        {ONBOARDING_TEXT.DESC_3}
      </p>
    </div>
  );
};
