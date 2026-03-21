import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const BottomNav = () => {
    return (
        <div className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <FaHome className="bottom-nav-icon" />
                <span>Home</span>
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <FaSearch className="bottom-nav-icon" />
                <span>Search</span>
            </NavLink>
        </div>
    );
};

export default BottomNav;
