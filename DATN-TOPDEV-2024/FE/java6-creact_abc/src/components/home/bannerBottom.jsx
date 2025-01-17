import React, { useEffect, useState } from 'react';
import imgBanner1 from "../../assets/images/imageBanner/banner4.jpg";  // Chỉnh sửa đường dẫn ảnh
import AOS from 'aos';  // Import thư viện AOS
import 'aos/dist/aos.css';  // Import các style của AOS

const BannerPhu = () => {
    const [scrollingUp, setScrollingUp] = useState(false);  // State để theo dõi khi cuộn lên

    useEffect(() => {
        AOS.init({ duration: 1000 });  // Khởi tạo AOS với hiệu ứng kéo dài 1 giây
    }, []);

    useEffect(() => {
        let lastScrollTop = 0;  // Để lưu vị trí cuộn trước đó
        const handleScroll = () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;  // Vị trí cuộn hiện tại
            if (currentScroll > lastScrollTop) {
                setScrollingUp(false);  // Cuộn xuống
            } else {
                setScrollingUp(true);  // Cuộn lên
            }
            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Đảm bảo không bị âm
        };

        window.addEventListener('scroll', handleScroll);  // Lắng nghe sự kiện cuộn trang

        // Cleanup để ngừng lắng nghe sự kiện khi component bị unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`items-center justify-center py-5 ${scrollingUp ? 'opacity-0' : 'opacity-100'}`} data-aos="fade-up">
            <div className="w-full max-w-7xl mx-auto">
                <div className="relative">
                    <img
                        src={imgBanner1}
                        alt="Banner 1"
                        className="w-full object-cover rounded-lg h-96"
                    />
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-start p-8 text-white">
                        <p className="text-orange-500 text-sm mb-2">Widescreen 4k .......</p>
                        <h1 className="text-4xl font-bold leading-snug mb-4">
                            CÔNG NGHỆ ĐỘT PHÁ <br /> VÀ TIÊN TIẾN
                        </h1>
                        <p className="text-gray-200 mb-6">Sang trọng, hiện đại, hấp dẫn,....</p>
                        <p className="text-orange-400 text-xl font-bold mb-6">
                            Ưu đãi <span className="text-4xl font-extrabold">70%</span>{" "}
                            <span className="text-white">2,990,000đ</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerPhu;
