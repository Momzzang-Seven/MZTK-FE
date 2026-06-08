import { useEffect } from "react";
import PinPad from "@components/auth/PinPad";

type MyTxPinSectionProps = {
  inputPin: string;
  onInput: (digit: string) => void;
  onDelete: () => void;
  onComplete: (pin: string) => void;
};

export const MyTxPinSection = ({
  inputPin,
  onInput,
  onDelete,
  onComplete,
}: MyTxPinSectionProps) => {
  useEffect(() => {
    if (inputPin.length === 6) {
      onComplete(inputPin);
    }
  }, [inputPin, onComplete]);

  return (
    <div className="flex flex-col h-dvh bg-white px-6 overflow-hidden">
      <PinPad
        title="PIN 번호를 입력해주세요"
        pin={inputPin}
        onInput={(num: number) => onInput(num.toString())}
        onDelete={onDelete}
      />
    </div>
  );
};
