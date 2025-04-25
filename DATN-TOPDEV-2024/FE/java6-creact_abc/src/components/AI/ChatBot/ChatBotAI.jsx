import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button, Spinner } from "@nextui-org/react";

const ChatBot = () => {
    const [chatHistory, setChatHistory] = useState([]);
    const [userQuestion, setUserQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [botTypingMessage, setBotTypingMessage] = useState("");
    const chatContainerRef = useRef(null);

    const suggestedQuestions = [
        { text: "Địa chỉ cửa hàng ở đâu?", icon: "location" },
        { text: "Làm thế nào để liên hệ với tôi?", icon: "contact" },
        { text: "Sản phẩm nào bán chạy?", icon: "hot" },
        { text: "Có ship toàn quốc không?", icon: "shipping" },
        { text: "Dịch vụ bảo hành thế nào?", icon: "warranty" },
    ];

    // Icons for the suggested questions
    const questionIcons = {
        location: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        contact: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        hot: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        shipping: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
        ),
        warranty: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
    };

    // Message types and their animations
    const messageVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, botTypingMessage]);

    const sendQuestion = async (text) => {
        const questionToSend = text || userQuestion.trim();
        if (!questionToSend) return;

        setLoading(true);
        setChatHistory((prev) => [...prev, { sender: "user", message: questionToSend }]);
        setUserQuestion("");
        setIsTyping(true);
        setBotTypingMessage("");

        try {
            const response = await axios.post("http://localhost:5001/api/chat", {
                question: questionToSend,
            });
            const botAnswer = response.data.answer;
            typeWriterEffect(botAnswer);
        } catch (error) {
            typeWriterEffect("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    const typeWriterEffect = (text) => {
        setChatHistory((prev) => [...prev, { sender: "bot", message: text }]);
        setIsTyping(false);
        setBotTypingMessage("");
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    };

    const formatMessage = (message) => {
        // Kiểm tra xem nội dung có phải là HTML hay không
        const isHTML = /<\/?[a-z][\s\S]*>/i.test(message);
        if (isHTML) {
            return (
                <div
                    dangerouslySetInnerHTML={{ __html: message }}
                    className="text-gray-800"
                />
            );
        }

        // Nếu không phải HTML, xử lý nội dung như bình thường
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return message.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    // Random bot reactions to add after responses
    const botReactions = [
        "😊", "👍", "🎉", "✨", "🛒", "📦", "🚚", "💯", "⭐"
    ];

    const getRandomReaction = () => {
        return botReactions[Math.floor(Math.random() * botReactions.length)];
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 pb-7">
            {/* Welcome message */}
            {chatHistory.length === 0 && (
                <div className="bg-gradient-to-b from-blue-50 to-gray-50 p-4 text-center custom-scrollbar">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium mb-1">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                        <p className="text-gray-500 text-sm">Hãy đặt câu hỏi hoặc chọn một gợi ý bên dưới</p>
                    </motion.div>
                </div>
            )}

            {/* Chat Area */}
            <div
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar"
                style={{ height: chatHistory.length === 0 ? '450px' : '500px' }}
            >
                {chatHistory.length === 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-gray-600 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                        <p className="mb-3 font-medium text-blue-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            Gợi ý câu hỏi:
                        </p>
                        <div className="grid gap-2">
                            {suggestedQuestions.map((question, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.02, backgroundColor: "#f0f9ff" }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Button
                                        size="sm"
                                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors text-left justify-start px-3 overflow-hidden text-ellipsis w-full"
                                        onClick={() => sendQuestion(question.text)}
                                        startContent={questionIcons[question.icon]}
                                    >
                                        {question.text}
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {chatHistory.map((chat, i) => (
                        <motion.div
                            key={i}
                            variants={messageVariants}
                            initial="hidden"
                            animate="visible"
                            className={`flex ${
                                chat.sender === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                            {chat.sender === "bot" && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 mb-auto mt-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clipRule="evenodd" />
                                    </svg>
                                </motion.div>
                            )}

                            <motion.div
                                className={`max-w-[75%] p-3 rounded-2xl shadow-sm break-words whitespace-pre-wrap text-sm ${
                                    chat.sender === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                }`}
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                            >
                                {formatMessage(chat.message)}
                                {chat.sender === "bot" && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                                        className="inline-block ml-2"
                                    >
                                        {getRandomReaction()}
                                    </motion.span>
                                )}
                            </motion.div>

                            {chat.sender === "user" && (
                                <motion.div
                                    initial={{ scale: 0, rotate: 10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white ml-2 mb-auto mt-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <motion.div
                            animate={{ rotate: [0, -5, 0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 mb-auto mt-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clipRule="evenodd" />
                            </svg>
                        </motion.div>

                        <div className="max-w-[75%] p-3 rounded-2xl bg-white text-gray-800 border border-gray-100 shadow-sm break-words whitespace-pre-wrap rounded-tl-none">
                            {botTypingMessage || (
                                <div className="flex space-x-1">
                                    <motion.span
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6 }}
                                        className="w-2 h-2 bg-blue-400 rounded-full"
                                    ></motion.span>
                                    <motion.span
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                        className="w-2 h-2 bg-blue-400 rounded-full"
                                    ></motion.span>
                                    <motion.span
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                        className="w-2 h-2 bg-blue-400 rounded-full"
                                    ></motion.span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                    <Button
                        isIconOnly
                        size="sm"
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full"
                        aria-label="Emoji"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                        </svg>
                    </Button>

                    <Input
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập câu hỏi của bạn..."
                        className="flex-grow"
                        disabled={loading}
                        startContent={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                        }
                        endContent={
                            <Button
                                isIconOnly
                                onClick={() => sendQuestion()}
                                disabled={loading || !userQuestion.trim()}
                                className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full h-8 w-8 min-w-8 p-0 ${!userQuestion.trim() && 'opacity-50'}`}
                            >
                                {loading ? (
                                    <Spinner size="sm" color="white" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </Button>
                        }
                        classNames={{
                            inputWrapper: "bg-gray-100 hover:bg-gray-200 focus-within:bg-gray-200 rounded-full px-3",
                            input: "text-gray-800 placeholder-gray-500",
                        }}
                    />

                    <Button
                        isIconOnly
                        size="sm"
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full"
                        aria-label="Attach"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </Button>
                </div>
                <div className="mt-3 text-center">
                    <p className="text-gray-400 text-xs">Powered by Shop Assistant AI</p>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;