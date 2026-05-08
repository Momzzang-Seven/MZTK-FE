import joyIcon from "@assets/joy.svg";
import { VERIFY_TEXT } from "@constant/location";

export const VerifySuccessOverlay = () => {
  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center pb-20 animate-fade-in">
      {/* Stickman Image */}
      <div className="relative mb-8">
        <img
          src={joyIcon}
          alt="Success Stickman"
          className="w-72 h-72 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.innerHTML =
              '<div class="text-[100px]">🏃</div>';
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-2 relative">
        {/* Text with Streak Badge */}
        <div className="relative">
          <h2 className="text-3xl font-bold text-main tracking-tight">
            {VERIFY_TEXT.SUCCESS_TITLE}
          </h2>
        </div>

        <p className="text-3xl font-bold text-main/80">
          {VERIFY_TEXT.SUCCESS_XP}
        </p>
      </div>
    </div>
  );
};
