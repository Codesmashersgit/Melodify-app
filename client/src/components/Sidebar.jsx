import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import logo from '../assets/melodify.png';
import globalIcon from '../assets/global.png';

const Sidebar = () => {
  return (
    <div className='sidebar-container'>
      <div className='sidebar-box'>
        <div className='logo-item' style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', marginBottom: '8px' }}>
          <img src={logo} alt='Melodify' style={{ filter: 'none', width: '32px' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Melodify</span>
        </div>

        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} no-hover`}>
          <img src='https://cdn-icons-png.flaticon.com/512/1946/1946436.png' alt='Home' />
          <span>Home</span>
        </NavLink>

        <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} no-hover`}>
          <img src='https://cdn-icons-png.flaticon.com/512/122/122932.png' alt='Search' />
          <span>Search</span>
        </NavLink>
      </div>

      <div className='sidebar-box flex-grow'>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div className='nav-item' style={{ padding: 0 }}>
            <img src='https://cdn-icons-png.flaticon.com/512/2989/2989835.png' alt='Library' />
            <span>Your Library</span>
          </div>
          <span style={{ fontSize: '1.2rem', cursor: 'pointer', color: 'var(--melodify-dim-white)' }}>+</span>
        </div>

        <div className='sidebar-box' style={{ backgroundColor: 'var(--melodify-light-grey)', marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '8px' }}>Create your first playlist</h4>
          <p style={{ fontSize: '0.8rem', color: 'white', marginBottom: '16px' }}>It's easy, we'll help you</p>
          <button className='btn-premium'>Create playlist</button>
        </div>

        <div className='sidebar-box' style={{ backgroundColor: 'var(--melodify-light-grey)' }}>
          <h4 style={{ marginBottom: '8px' }}>Let's find some podcasts to follow</h4>
          <p style={{ fontSize: '0.8rem', color: 'white', marginBottom: '16px' }}>We'll keep you updated on new episodes</p>
          <button className='btn-premium'>Browse podcasts</button>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: 'var(--melodify-dim-white)' }}>
          <span>Legal</span>
          <span>Privacy Center</span>
          <span>Privacy Policy</span>
          <span>Cookies</span>
          <span>About Ads</span>
          <span>Accessibility</span>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button className='btn-premium' style={{ background: 'transparent', color: 'white', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={globalIcon} style={{ width: '16px', filter: 'invert(1)' }} alt='Language' />
            English
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
