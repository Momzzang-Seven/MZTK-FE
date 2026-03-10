import { useNavigate } from "react-router-dom";

export const TxTkn = () => {
  const navigate = useNavigate();
  const handleClickTknTx = () => {
    navigate("/myTknTx");
  };

  return (
    <div
      onClick={handleClickTknTx}
      className="flex flex-row gap-x-2 rounded-lg p-4 w-full h-16 items-center justify-center bg-white border border-main border-2"
    >
      <img src="/icon/wallet.svg" alt="walletIcon" />
      <div className="text-main label-bold">MZTK 송금</div>
    </div>
  );
};
