interface SummaryCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: string;
  iconBg?: string;
}

const SummaryCard = ({
  title,
  value,
  subValue,
  icon,
  iconBg,
}: SummaryCardProps) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      {subValue && (
        <p
          className={`text-xs mt-2 ${subValue.includes("BAN") ? "text-red-500" : "text-gray-500"}`}
        >
          {subValue}
        </p>
      )}
    </div>
    <div
      className={`${iconBg} p-2 rounded-lg w-[48px] h-[48px] flex justify-center items-center shadow-lg shadow-black/5`}
    >
      <img src={icon} alt="iconImg" className="w-6 h-6 brightness-0 invert" />
    </div>
  </div>
);
export default SummaryCard;
