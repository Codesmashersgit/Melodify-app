import React, { useEffect, useState } from 'react';
import logo from '../assets/melodify.png';

const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2200); // Show splash for 2.2 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="splash-screen">
            <div className="splash-content">
                <div className="splash-logo-wrapper">
                    <img src={logo} alt="Melodify Logo" className="splash-logo" />
                </div>
                <h1 className="splash-title">Melodify</h1>
                <div className="splash-loader"></div>
            </div>
            <p className="splash-subtitle">Premium Audio Experience</p>
        </div>
    );
};

export default SplashScreen;
