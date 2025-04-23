import React, { useState } from "react";
import ChatBot from "./ChatBotAI";
import { motion, AnimatePresence } from "framer-motion";

const FloatingChatbox = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-96 sm:w-[450px] h-[700px] mb-4 bg-white shadow-2xl overflow-hidden border border-gray-100"
                    >
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <h3 className="text-lg font-medium">Trợ lý ảo</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="text-white hover:bg-blue-700 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label="Minimize"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    onClick={toggleChat}
                                    className="text-white hover:bg-blue-700 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label="Close chat"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <ChatBot />
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                onClick={toggleChat}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`${isOpen ? 'bg-gray-700' : 'bg-blue-600'} text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring focus:ring-blue-400`}
                style={{
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
                }}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </motion.button>
        </div>
    );
};

export default FloatingChatbox;