import React, { useState,useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import Bg150 from '../../assets/images/imageBanner/150x150.png';

const CountdownSale = () => {
    const [time, setTime] = useState({ minutes: 16, seconds: 29, milliseconds: 56 });
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prevTime => {
                let { minutes, seconds, milliseconds } = prevTime;

                if (milliseconds > 0) {
                    milliseconds--;
                } else {
                    if (seconds > 0) {
                        seconds--;
                        milliseconds = 59;
                    } else {
                        if (minutes > 0) {
                            minutes--;
                            seconds = 59;
                            milliseconds = 59;
                        } else {
                            clearInterval(interval);
                        }
                    }
                }

                return { minutes, seconds, milliseconds };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    const productsSale = [
        {
            id: 1,
            name: 'TAI NGHE BLUETOOTH ANKER SOUNDBUDS',
            price: '900,000₫',
            oldPrice: '1,000,000₫',
            image: Bg150
        },
        {
            id: 2,
            name: 'Túi Chống Nước Anker – A7095',
            price: '200,000₫',
            oldPrice: '500,000₫',
            image: Bg150
        },
        {
            id: 3,
            name: 'Túi Chống Nước Anker (2 Cái) – B7095',
            price: '350,000₫',
            oldPrice: '800,000₫',
            image: Bg150
        },
        {
            id: 4,
            name: 'Túi Đựng Pin Dự Phòng Anker PowerCore 10000',
            price: '180,000₫',
            oldPrice: '280,000₫',
            image: Bg150
        },
        {
            id: 5,
            name: 'Túi Đựng Pin Dự Phòng Anker PowerCore 20000',
            price: '220,000₫',
            oldPrice: '350,000₫',
            image: Bg150
        },
        {
            id: 1,
            name: 'TAI NGHE BLUETOOTH ANKER SOUNDBUDS',
            price: '900,000₫',
            oldPrice: '1,000,000₫',
            image: Bg150
        },
        {
            id: 2,
            name: 'Túi Chống Nước Anker – A7095',
            price: '200,000₫',
            oldPrice: '500,000₫',
            image: Bg150
        },
        {
            id: 3,
            name: 'Túi Chống Nước Anker (2 Cái) – B7095',
            price: '350,000₫',
            oldPrice: '800,000₫',
            image: Bg150
        },
        {
            id: 4,
            name: 'Túi Đựng Pin Dự Phòng Anker PowerCore 10000',
            price: '180,000₫',
            oldPrice: '280,000₫',
            image: Bg150
        },
        {
            id: 5,
            name: 'Túi Đựng Pin Dự Phòng Anker PowerCore 20000ssss',
            price: '220,000₫',
            oldPrice: '350,000₫',
            image: Bg150
        }
    ];
    const responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '480px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    const productTemplate = (product) => {
        return (
            <div className="w-[235px] mt-3 h-[306.56px] relative girl">
                <div className="w-[210px] h-[36.38px] left-0 top-[265.18px] absolute">
                    <div className="w-[204.76px] h-[34.19px] left-0 top-[1px] absolute text-[#0066cc] text-sm font-normal font-['Work Sans'] leading-[18.20px] girl">
                        {product.name}
                    </div>
                </div>
                <img className="w-[210px] h-[210px] left-0 top-0 absolute girl" src={product.image} alt={product.name} />
                <div className="w-[83.95px] h-[21px] left-0 top-[231.98px] absolute">
                    <div className="w-[84.28px] h-[21px] left-0 top-0 absolute text-[#669900] text-lg font-semibold font-['Work Sans'] leading-relaxed girl">
                        {product.price}
                    </div>
                </div>
                <div className="w-[72.38px] h-4 left-[93.95px] top-[233.78px] absolute">
                    <div className="w-[72.69px] h-4 left-0 top-0 absolute text-[#999999] text-sm font-normal font-['Work Sans'] line-through leading-tight girl">
                        {product.oldPrice}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <>
            {/* Start section countdown  */}
            <div className="w-full h-[79.59px] border-b border-[#e1e1e1] flex items-center justify-between px-5">
                <div className="text-black text-[28px] font-semibold font-['Work Sans'] leading-[33.60px]">
                    Ưu đãi giới hạn
                </div>
                <div className="flex items-center bg-[#f14705] rounded-[3px] px-3 py-1">
                    <div className="text-white text-lg font-semibold font-['Work Sans'] leading-[18px] mr-2">
                        Thời gian còn lại:
                    </div>
                    <div className="flex items-center">
            <span className="text-white text-lg font-semibold font-['Work Sans'] leading-[18px] mr-1">
              {String(time.minutes).padStart(2, '0')}
            </span>
                        <span
                            className="text-white text-lg font-semibold font-['Work Sans'] leading-[18px] mr-1">:</span>
                        <span className="text-white text-lg font-semibold font-['Work Sans'] leading-[18px] mr-1">
              {String(time.seconds).padStart(2, '0')}
            </span>
                        <span
                            className="text-white text-lg font-semibold font-['Work Sans'] leading-[18px] mr-1">:</span>
                        <span className="text-white text-lg font-semibold font-['Work Sans'] leading-[18px]">
              {String(time.milliseconds).padStart(2, '0')}
            </span>
                    </div>
                </div>
                <div className="bg-[#fcb800] rounded-[5px] py-2 px-4">
                    <div className="text-black text-base font-medium font-['Work Sans'] leading-relaxed">
                        Xem tất cả
                    </div>
                </div>
            </div>
            <Carousel
                value={productsSale}
                numVisible={5}
                numScroll={5}
                responsiveOptions={responsiveOptions}
                itemTemplate={productTemplate}
            />

            {/* End section countdown  */}

        </>
    );
};
export default CountdownSale;