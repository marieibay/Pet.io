import React from 'react';

interface StatusBarProps {
    label: string;
    value: number;
    icon: React.ReactNode;
}

const StatusBar: React.FC<StatusBarProps> = ({ label, value, icon }) => {
    const isLow = value < 25;
    const barColor = isLow ? 'bg-red-500' : 'bg-lime-400';

    return (
        <div>
            <div className="flex justify-between items-center mb-1 text-zinc-200">
                <span className="font-bold status-bar-label">{label}</span>
                {icon}
            </div>
            <div className="bg-zinc-700 h-5 border-2 border-zinc-200">
                <div
                    className={`h-full transition-all duration-500 ease-in-out ${barColor}`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
};

export default StatusBar;