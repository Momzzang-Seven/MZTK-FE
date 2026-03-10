import CommunityIcon from "@assets/community.svg";

type FooterItemType = {
  label: string;
  src: string;
  activeSrc: string;
  path: string;
};

export const footerItem: FooterItemType[] = [
  {
    label: "홈",
    src: "/icon/home.svg",
    activeSrc: "/icon/homeActive.svg",
    path: "/",
  },
  {
    label: "커뮤니티",
    src: CommunityIcon,
    activeSrc: "/icon/communityActive.svg",
    path: "/community",
  },
  {
    label: "마켓",
    src: "/icon/market.svg",
    activeSrc: "/icon/marketActive.svg",
    path: "/market",
  },
  {
    label: "마이페이지",
    src: "/icon/user.svg",
    activeSrc: "/icon/userActive.svg",
    path: "/my",
  },
];

export const TRAINER_FOOTER_ITEM: FooterItemType = {
  label: "내 클래스",
  src: "/icon/dumbellFooter.svg",
  activeSrc: "/icon/dumbellActiveFooter.svg",
  path: "/trainer",
};
