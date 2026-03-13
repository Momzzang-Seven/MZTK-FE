interface RegisterHeaderProps {
    title: string;
    onBack: () => void;
    nextLabel?: string;
    onNext?: () => void;
    isNextDisabled?: boolean;
}

const RegisterHeader = ({ title, onBack, nextLabel, onNext, isNextDisabled }: RegisterHeaderProps) => {
    return (
        <div className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-50">
            <button onClick={onBack} className="p-2 -ml-2">
                <img src="/icon/backArrow.svg" alt="back" className="w-6 h-6" />
            </button>
            <h1 className="text-[17px] font-bold text-gray-900">{title}</h1>
            <div className="w-16 flex justify-end">
                {nextLabel && (
                    <button 
                        onClick={onNext} 
                        disabled={isNextDisabled}
                        className={`text-[16px] font-black transition-all active:opacity-50 !bg-transparent disabled:!bg-transparent border-none outline-none p-0 min-w-0 ${isNextDisabled ? 'text-gray-200' : 'text-main'}`}
                    >
                        {nextLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default RegisterHeader;
