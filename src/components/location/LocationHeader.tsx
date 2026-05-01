import { UI_TEXT } from "@constant/index";

export const LocationHeader = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-white px-5 pt-6 pb-4 rounded-b-[20px] shadow-sm">
      <h1 className="text-3xl font-bold text-main mb-2">
        {UI_TEXT.HEADER_TITLE}
      </h1>
      <div className="mt-3 bg-main text-white px-4 py-3 rounded-xl shadow-md">
        <p className="font-bold text-xs leading-relaxed">
          {UI_TEXT.HEADER_TIP}
        </p>
      </div>
    </div>
  );
};
