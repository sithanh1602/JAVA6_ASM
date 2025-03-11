import React from 'react';
import {FaHeadset, FaShieldAlt, FaShippingFast, FaUndo} from "react-icons/fa";
import Product1 from "../../assets/images/imageProducts/productFeature.png";

const FeatureSection = () => {

    const features = [
        { icon: <FaShippingFast />, title: "Giao hàng miễn phí", desc: "Cho đơn hàng trên 5,000,000₫" },
        { icon: <FaUndo />, title: "Hoàn trả 90 ngày", desc: "Nếu sản phẩm có vấn đề" },
        { icon: <FaShieldAlt />, title: "Thanh toán an toàn", desc: "100% thanh toán an toàn" },
        { icon: <FaHeadset />, title: "Hỗ trợ 24/7", desc: "Hỗ trợ chuyên dụng" },
    ];
    const products = [
        { name: "CPU Intel Core i7", image: Product1, specs: "3.8GHz, 8 Cores", desc: "Hiệu năng mạnh mẽ ", discount: "20%" },
        { name: "RAM Kingston 16GB", image: Product1, specs: "DDR4 3200MHz", desc: "Tăng tốc độ xử lý, tối ưu đa nhiệm", discount: "15%" },
        { name: "SSD Samsung 1TB NVMe", image: Product1, specs: "PCIe Gen4, Tốc độ cao", desc: "Lưu trữ nhanh, giảm thời gian tải", discount: "30%" },
    ];

    return(
        <>
                {/* Start section sale  */}
                <div className="w-full mx-auto mt-8 mb-14 bg-gray-100 py-1 px-6 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                        {features.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="text-3xl text-blue-500">{item.icon}</div>
                                <div>
                                    <h3 className="text-lg font-medium text-black">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                                {index !== features.length - 1 && <div className="h-10 w-px bg-gray-300" />}
                            </div>
                        ))}
                    </div>
                </div>
                {/* End section sale */}


                {/* Start section product  */}
                <div className="flex space-x-6 mb-10">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="w-[390px] h-[190px] border border-black/20 relative flex items-center px-6"
                        >
                            <div className="flex flex-col">
                                <div className="text-black text-base font-normal leading-normal">
                                    {product.name} <br /> {product.specs}
                                </div>
                                <div className="text-[#666666] text-xs font-normal mt-3">
                                    {product.desc}
                                </div>
                            </div>
                            <div className="w-[40px] h-[40px] bg-[#f14705] rounded-full flex items-center justify-center absolute left-[10px] top-[10px]">
                                <div className="text-white text-sm font-semibold text-center">
                                    {product.discount}
                                </div>
                            </div>
                            <img
                                src={product.image}
                                alt={product.name}
                                className="absolute right-0.5 w-[100px] h-[160px] object-cover"
                            />
                        </div>
                    ))}
                </div>
                {/* End section product  */}


            </>
            );
            }
            export default FeatureSection;

