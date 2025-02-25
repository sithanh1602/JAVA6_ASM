import React, { useState } from "react";
import ChatBot from "./ChatBotAI";

const FloatingChatbox = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="w-80 h-96 flex flex-col relative">
                    <div className="absolute top-2 right-2">
                    </div>
                    <ChatBot />
                </div>
            )}
            <button
                onClick={toggleChat}
                className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 text-xl ${
                    isOpen ? "mt-2" : ""
                }`}
            >
                💬
            </button>
        </div>
    );
};

export default FloatingChatbox;
