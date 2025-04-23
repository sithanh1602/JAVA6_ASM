import React from "react";

const FirstSection = () => {
  return (
    <section className="pt-10 pb-16 bg-gray-100">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-2
    ">
        <div className="text-sm text-gray-600 mb-2 col-span-full px-2">
          <a href="#" className="text-blue-600 hover:underline font-medium">
            Trang chủ
          </a>{" "}
          / <span className="text-gray-800 font-semibold">Tin tức</span>
        </div>

        {/* Ảnh lớn bên trái */}
        <div className="relative group overflow-hidden shadow-lg">
          <img
            src="https://www.phongcachxanh.vn/cdn/shop/articles/ban-phim-co-custom-la-gi-ban-phim-co-custom-khac-gi-so-voi-ban-phim-co-binh-thuong-562326_0e9986d1-386a-4246-9858-fb7240560a20.jpg?v=1741535901&width=2048"
            alt="Bài viết"
            className="w-full h-72 lg:h-[28rem] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent text-white w-full">
            <span className="bg-blue-500 text-sm px-3 py-1">
              Phụ kiện PC
            </span>
            <h3 className="mt-3 font-bold text-3xl lg:text-4xl leading-snug">
              Bàn phím cơ custom – xu hướng mới cho game thủ
            </h3>
            <p className="text-sm mt-1 text-gray-200">
              24 Tháng 4, 2025 - bởi Minh Tuấn
            </p>
          </div>
        </div>

        {/* Hai ảnh nhỏ bên phải */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Ảnh 1 */}
          <div className="relative group overflow-hidden shadow-md">
            <img
              src="https://nguyencongpc.vn/media/news/3012_R3JobgWmPWeUCavzKpzFpB-970-80.jp.jpg"
              alt="Bài viết"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white w-full">
              <span className="bg-blue-500 text-sm px-3 py-1">Mainboard</span>
              <h4 className="mt-2 font-semibold text-xl leading-snug">
                So sánh bo mạch chủ Z690 và B660: Chọn loại nào?
              </h4>
              <p className="text-xs mt-1 text-gray-200">
                20 Tháng 4, 2025 - bởi Thanh Huyền
              </p>
            </div>
          </div>

          {/* Ảnh 2 */}
          <div className="relative group overflow-hidden shadow-md">
            <img
              src="https://i.pinimg.com/736x/a3/e3/d9/a3e3d9fd3372c2c6386c27937eb6ffd6.jpg"
              alt="Bài viết"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white w-full">
              <span className="bg-blue-500 text-sm px-3 py-1">
                Card đồ họa
              </span>
              <h4 className="mt-2 font-semibold text-xl leading-snug">
                RTX 4070 Ti – Hiệu năng đáng giá trong tầm giá?
              </h4>
              <p className="text-xs mt-1 text-gray-200">
                18 Tháng 4, 2025 - bởi Nhật Long
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FirstSection;
