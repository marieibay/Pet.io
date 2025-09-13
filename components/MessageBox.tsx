import React from 'react';

interface MessageBoxProps {
    message: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message }) => {
    return (
        <div className="bg-zinc-900 border-4 border-zinc-200 p-3 min-h-[50px] flex items-center justify-center text-center text-zinc-200 text-lg">
            <p>{message}</p>
        </div>
    );
};

export default MessageBox;