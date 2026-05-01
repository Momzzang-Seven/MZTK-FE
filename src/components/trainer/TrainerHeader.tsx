import { useNavigate } from "react-router-dom";

interface TrainerHeaderProps {
    title: string;
    showBack?: boolean;
    backTo?: string;
}

const TrainerHeader = ({ title, showBack = false, backTo }: TrainerHeaderProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between p-5 bg-white sticky top-0 z-30 border-b border-gray-100">
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={() => {
                            if (backTo) {
                                navigate(backTo);
                                return;
                            }
                            navigate(-1);
                        }}
                        className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <img src="/icon/backArrow.svg" alt="back" className="w-6 h-6" />
                    </button>
                )}
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>

        </div>
    );
};

export default TrainerHeader;
