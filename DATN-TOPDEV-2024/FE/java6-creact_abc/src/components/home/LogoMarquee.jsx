import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'aos/dist/aos.css';
import Marquee from "react-fast-marquee";
import Logo1 from "../../assets/images/imageBrands/logo1.png";
import Logo2 from '../../assets/images/imageBrands/logo2.png';
import Logo3 from '../../assets/images/imageBrands/logo3.png';
import Logo4 from '../../assets/images/imageBrands/logo4.png';
import Logo5 from '../../assets/images/imageBrands/logo5.png';
import Logo6 from '../../assets/images/imageBrands/logo6.png';
import Logo7 from '../../assets/images/imageBrands/logo7.png';
import Logo8 from '../../assets/images/imageBrands/logo8.png';
import Logo9 from '../../assets/images/imageBrands/logo9.png';
import Logo10 from '../../assets/images/imageBrands/logo10.png';



const LogoMarquee = () => {

    const logo = [Logo1, Logo2, Logo3, Logo4, Logo5, Logo6, Logo7, Logo8, Logo9, Logo10];

    return (
        <>
            {/* Start slide logo  */}
            <Marquee gradient={false} speed={50} pauseOnHover={true}>
                {logo.map((logo, index) => (
                    <div key={index} className="mx-9 mt-10 mb-10">
                        <img src={logo} alt="logo"
                             className="h-16 grayscale hover:grayscale-0 transition-all duration-300"/>
                    </div>
                ))}
            </Marquee>
            {/* End slide logo  */}

        </>
    );
}
export default LogoMarquee;

