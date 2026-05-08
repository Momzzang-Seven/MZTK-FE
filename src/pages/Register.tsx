import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import runnerAnimation from "@assets/runner.json";
import { CommonButton } from "@components/common";
import { FullScreenPage } from "@components/layout";
import { REGISTER_TEXT } from "@constant";

const Register = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    console.log(`Selected Role: ${role}`);
    navigate("/onboarding");
  };

  return (
    <FullScreenPage className="pt-20 pb-10">
      {/* 1. Header Section */}
      <div className="flex flex-col mb-8 mt-2">
        <h1 className="font-gmarket text-[28px] leading-tight text-black mb-4 whitespace-pre-line">
          {REGISTER_TEXT.TITLE.split("서비스").map((text, i) => (
            <span key={i}>
              {text}
              {i === 0 && <span className="text-main">서비스</span>}
            </span>
          ))}
        </h1>
        <p className="text-color-grey-deep text-[16px] leading-relaxed">
          {REGISTER_TEXT.DESC}
        </p>
      </div>

      {/* 2. Animation Section */}
      <div className="flex-1 flex justify-center items-center">
        <div className="w-80 h-80">
          <Lottie animationData={runnerAnimation} loop />
        </div>
      </div>

      {/* 3. Button Group Section */}
      <div className="flex flex-col gap-4">
        {REGISTER_TEXT.ROLES.map((role) => (
          <CommonButton
            key={role.id}
            label={role.label}
            bgColor={role.bgColor}
            textColor={role.textColor}
            border={role.border}
            className="h-[60px] rounded-xl active:opacity-90 transition-opacity"
            onClick={() => handleRoleSelect(role.id)}
          />
        ))}
      </div>
    </FullScreenPage>
  );
};

export default Register;
