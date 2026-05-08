import { CommonButton } from "@components/common";
import { RestTkn, WithdrawAddr, WithdrawAmt } from "@components/token";

type MyTxMainSectionProps = {
  balance: number;
  amount: string;
  address: string;
  isAmountValid: boolean;
  isAddressValid: boolean;
  onChangeAmount: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onNext: () => void;
};

export const MyTxMainSection = ({
  balance,
  amount,
  address,
  isAmountValid,
  isAddressValid,
  onChangeAmount,
  onChangeAddress,
  onNext,
}: MyTxMainSectionProps) => {
  return (
    <div className="flex flex-1 flex-col pt-[38px] px-[22px] gap-y-5 animate-in fade-in">
      <RestTkn amt={balance} />
      <WithdrawAmt amt={balance} value={amount} onChange={onChangeAmount} />
      <WithdrawAddr value={address} onChange={onChangeAddress} />

      <div className="mt-auto pb-10">
        <CommonButton
          label="송금 요청"
          onClick={onNext}
          disabled={!isAmountValid || !isAddressValid}
          className="h-14"
        />
      </div>
    </div>
  );
};
