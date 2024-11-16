import React, { useState } from 'react';
import ChatBox from './ChatBox'; // We will create the ChatBox component in the next step

const MessageIcon = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChatBox = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={toggleChatBox}
                className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all"
            >
                <i className="fas fa-comment"></i> {/* You can use any chat icon here */}
            </button>

            {isChatOpen && <ChatBox closeChat={toggleChatBox} />}
        </div>
    );
};

export default MessageIcon;
