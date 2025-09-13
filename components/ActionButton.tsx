import React from 'react';

interface ActionButtonProps {
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled, children, icon }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 bg-fuchsia-500 text-zinc-900 text-xl font-bold py-3 px-4 transition-all duration-100 ease-in-out btn-retro disabled:bg-zinc-600 disabled:text-zinc-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
            {icon}
            {children}
        </button>
    );
};

export default ActionButton;