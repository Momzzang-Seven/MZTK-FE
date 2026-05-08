export const REGISTER_TEXT = {
  TITLE: "어떤 서비스로 \n 시작할까요?",
  DESC: "본인에게 맞는 가입 유형을 선택해주세요.",
  ROLES: [
    {
      id: "TRAINER",
      label: "트레이너로 시작하기",
      bgColor: "bg-main",
      textColor: "text-black",
      border: "",
    },
    {
      id: "MEMBER",
      label: "회원으로 시작하기",
      bgColor: "bg-white",
      textColor: "text-black",
      border: "border-2 border-main",
    },
  ],
} as const;
