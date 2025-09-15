import React from 'react';

interface HeaderProps {
    className?: string;
    isMuted: boolean;
    onToggleMute: () => void;
}

const Header: React.FC<HeaderProps> = ({ className, isMuted, onToggleMute }) => {
    return (
        <header className={`ui-panel flex items-center justify-between ${className || ''}`}>
            <h1 className="text-2xl text-white">
                Pet.io
            </h1>
            <div className="flex items-center gap-2">
                <button onClick={onToggleMute} className="ui-button p-3 flex items-center justify-center" aria-label="Toggle Mute">
                    <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-2xl`}></i>
                </button>
            </div>
        </header>
    );
};

export default Header;