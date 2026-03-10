import { footerItem, TRAINER_FOOTER_ITEM } from "@constant";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@store";

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();

  const isTrainer = user?.role === "TRAINER";
  const items = isTrainer
    ? [...footerItem.slice(0, 3), TRAINER_FOOTER_ITEM, footerItem[3]]
    : footerItem;

  return (
    <div className="z-[998] w-full fixed max-w-[420px] rounded-t-[20px] bg-white bottom-0 flex flex-row justify-between items-center h-[82px] px-[20px] py-[10px] shadow-[0_-4px_8px_rgba(0,0,0,0.05)]">
      {/* footer item map */}
      <div className="w-full grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const path = location.pathname;
          // Home ('/') should be exact match, others can be prefix matches
          const isActive =
            item.path === "/" ? path === "/" : path.startsWith(item.path);

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center"
            >
              <img
                src={isActive ? item.activeSrc : item.src}
                alt={item.label}
                width="32px"
                height="32px"
              />
              <div
                className={`${isActive ? "text-main body-bold" : "text-grey-main body"
                  }`}
              >
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
