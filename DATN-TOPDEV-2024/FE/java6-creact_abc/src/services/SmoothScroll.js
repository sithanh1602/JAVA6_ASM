// SmoothScroll.js
import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

const SmoothScroll = ({ children }) => {
    const lenisRef = useRef(null);

    useEffect(() => {
        lenisRef.current = new Lenis({
            lerp: 0.1,
            duration: 1.5,
            smoothTouch: true,
        });

        function raf(time) {
            lenisRef.current.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(raf);
        };
    }, []);

    return <>{children}</>;
};

export default SmoothScroll;
