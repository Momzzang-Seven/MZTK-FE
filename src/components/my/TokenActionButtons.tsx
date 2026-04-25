import { useNavigate } from "react-router-dom";
import { CommonButton } from "@components/common";

export const TokenActionButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row gap-3 w-full">
      <CommonButton
        label="지갑 변경"
        onClick={() => navigate("/register-wallet")}
        bgColor="bg-white"
        textColor="text-main"
        border="border-2 border-main"
        img="/icon/wallet.svg"
        className="flex-1 h-12 font-bold text-sm rounded-xl"
      />
      <CommonButton
        label="토큰 내역"
        onClick={() => navigate("/my-tkn-history")}
        bgColor="bg-white"
        textColor="text-main"
        border="border-2 border-main"
        img="/icon/tokenHistory.svg"
        className="flex-1 h-12 font-bold text-sm rounded-xl"
      />
    </div>
  );
};
