import React, { useState } from "react";

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "01. Có cung cấp vận chuyển quốc tế không?",
            answer: "Đúng! Chúng tôi cung cấp dịch vụ vận chuyển quốc tế đến nhiều quốc gia trên toàn thế giới. Khi đặt hàng, bạn có thể chọn địa chỉ giao hàng của bạn và chúng tôi sẽ gửi sản phẩm đến đó.",
        },
        {
            question: "02. Có thể trả lại sản phẩm nếu không hài lòng không?",
            answer: "Có! Chúng tôi chấp nhận trả lại sản phẩm trong vòng 30 ngày nếu bạn không hài lòng với sản phẩm.",
        },
        {
            question: "03. Có chấp nhận các phương thức thanh toán nào?",
            answer: "Chúng tôi chấp nhận thanh toán qua thẻ tín dụng, PayPal và các ví điện tử phổ biến.",
        },
    ];

    return (
        <div className="md:col-span-4 space-y-4">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="bg-gray-100 p-4 rounded cursor-pointer"
                    onClick={() => toggleAccordion(index)}
                >
                    <h2 className="font-bold">{faq.question}</h2>
                    <div
                        className={`transition-all duration-300 overflow-hidden ${
                            activeIndex === index ? "max-h-screen" : "max-h-0"
                        }`}
                    >
                        <p className="mt-2">{faq.answer}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FAQ;
