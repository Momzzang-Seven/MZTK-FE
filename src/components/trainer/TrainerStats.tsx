interface StatItem {
    label: string;
    value: string;
    unit: string;
}

interface TrainerStatsProps {
    stats: StatItem[];
}

const TrainerStats = ({ stats }: TrainerStatsProps) => {
    return (
        <div className="grid grid-cols-3 gap-3 px-5 py-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-1">{stat.label}</span>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                        <span className="text-[10px] text-gray-500">{stat.unit}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrainerStats;
