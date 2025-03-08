import React from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Carousel } from 'primereact/carousel';
import Banner1 from '../../assets/images/imageBanner/unnamed.webp';
import Banner2 from '../../assets/images/imageBanner/unnamed2.jpg';
import Banner3 from '../../assets/images/imageBanner/unnamed3.jpg';

const BannerCarousel = () => {
    const images = [Banner1, Banner2, Banner3];
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

    return (
        <>
                 {/*Start slide banner  */}
                <Carousel
                    value={images}
                    itemTemplate={(image, index) => (
                        <img
                            className="rounded-lg w-full"
                            src={image}
                            alt={`banner-${index}`}
                            style={{height: '400px', objectFit: 'cover'}}
                        />
                    )}
                    circular
                    autoplayInterval={3000}
                    showIndicators
                    showNavigators
                    responsiveOptions={responsiveOptions} // Thêm responsiveOptions vào Carousel
                />
                {/* End slide banner  */}

        </>

    );
};

export default BannerCarousel;