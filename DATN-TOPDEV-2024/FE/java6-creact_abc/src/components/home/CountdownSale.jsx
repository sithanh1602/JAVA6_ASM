import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useNavigate } from 'react-router-dom';
import ProductService from "../../services/ProductService";
import ProductCardNew from "../products/ProductCardNew";
import { FaShopify } from "react-icons/fa";

const CountdownSale = () => {
  const navigate = useNavigate();
  const [productsSale, setProductsSale] = useState([]);
  const [time, setTime] = useState({ minutes: 16, seconds: 29 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else clearInterval(interval);
        return { minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await ProductService.getDiscountedProduct();
        if (Array.isArray(data)) {
          setProductsSale(data.filter(item => item && item.id));
        } else {
          setError("Dữ liệu sản phẩm không đúng định dạng");
        }
      } catch (error) {
        setError("Không thể tải sản phẩm giảm giá");
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const responsiveOptions = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
    { breakpoint: '768px', numVisible: 2, numScroll: 1 },
    { breakpoint: '480px', numVisible: 1, numScroll: 1 }
  ];

  return (
    <div className="w-full">
      <div className="h-[79.59px] border-b border-[#e1e1e1] flex items-center justify-between px-5">
        <h2 className="text-3xl font-bold flex items-center gap-2">
                  <FaShopify className="text-red-500" />
                  Ưu đãi giới hạn
                </h2>
        <div className="flex items-center bg-[#f14705] rounded-[3px] px-3 py-1">
          <div className="text-white text-lg font-semibold font-['Work Sans'] mr-2">
            Thời gian còn lại:
          </div>
          <div className="flex items-center">
            <span className="text-white text-lg font-semibold">{String(time.minutes).padStart(2, '0')}</span>
            <span className="text-white text-lg font-semibold mx-1">:</span>
            <span className="text-white text-lg font-semibold">{String(time.seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
      {loading && <div className="text-center py-4">Đang tải...</div>}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}
      {!loading && !error && (
        <Carousel
          value={productsSale}
          numVisible={5}
          numScroll={5}
          responsiveOptions={responsiveOptions}
          itemTemplate={(variant) => <ProductCardNew variant={variant} index={productsSale.indexOf(variant)} />}
        />
      )}
    </div>
  );
};

export default CountdownSale;