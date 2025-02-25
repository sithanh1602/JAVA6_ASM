import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Input, Button, Card, CardBody, Spinner } from "@nextui-org/react";

const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [botTypingMessage, setBotTypingMessage] = useState("");
    const chatContainerRef = useRef(null);

    const suggestedQuestions = [
        "Địa chỉ cửa hàng ở đâu?",
        "Làm thế nào để liên hệ với tôi?",
        "Sản phẩm nào bán chạy?",
        "Có ship toàn quốc không?",
        "Dịch vụ bảo hành thế nào?",
    ];

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, botTypingMessage]);

    const sendMessage = async (text) => {
        const userMessage = text || input.trim();
        if (!userMessage) return;

        const newMessages = [...messages, { text: userMessage, user: true }];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);
        setBotTypingMessage(""); // Reset typing effect

        try {
            const response = await axios.post("http://localhost:8080/api/chat", { message: userMessage });
            const botReply = response.data || "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể thử lại?";
            typeWriterEffect(botReply, newMessages);
        } catch (error) {
            typeWriterEffect("Lỗi kết nối đến chatbot. Vui lòng thử lại sau.", newMessages);
        }
    };

    const typeWriterEffect = (text, newMessages) => {
        let index = 0;
        setBotTypingMessage(""); // Clear previous text
        const interval = setInterval(() => {
            if (index < text.length) {
                setBotTypingMessage((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(interval);
                setMessages([...newMessages, { text, user: false }]);
                setIsTyping(false);
                setBotTypingMessage("");
            }
        }, 30); // Adjust typing speed here
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Card className="max-w-md mx-auto p-4 shadow-lg bg-white rounded-lg">
            <CardBody ref={chatContainerRef} className="h-80 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-gray-500">
                        <p className="mb-2">Bạn có thể hỏi:</p>
                        <div className="grid gap-2">
                            {suggestedQuestions.map((question, index) => (
                                <Button
                                    key={index}
                                    size="sm"
                                    className="bg-gray-100 text-black"
                                    onClick={() => sendMessage(question)}
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-2 rounded-lg max-w-xs ${
                            msg.user ? "bg-primary text-white self-end" : "bg-gray-200 text-black self-start"
                        }`}
                    >
                        {msg.text}
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 0.6, repeatType: "reverse" }}
                        className="p-2 rounded-lg max-w-xs bg-gray-200 text-black self-start"
                    >
                        {botTypingMessage || "Đang trả lời..."}
                    </motion.div>
                )}
            </CardBody>

            <div className="flex mt-4 space-x-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="flex-grow"
                />
                <Button onClick={() => sendMessage()} disabled={isTyping} color="primary">
                    {isTyping ? <Spinner size="sm" /> : "Gửi"}
                </Button>
            </div>
        </Card>
    );
};

export default ChatBot;
