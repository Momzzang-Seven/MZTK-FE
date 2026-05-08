import { VERIFY_TEXT } from "@constant/location";

export const VerifyHeader = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-white px-5 pt-6 pb-4 rounded-b-[20px] shadow-sm">
      <h1 className="text-3xl font-bold text-main">{VERIFY_TEXT.TITLE}</h1>
    </div>
  );
};
