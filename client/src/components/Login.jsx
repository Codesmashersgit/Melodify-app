import React from 'react'
import { Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import logo from '../assets/melodify.png';
import globalIcon from '../assets/global.png';

const Login = () => {
  return (
    <div className='auth-container'>
      <img src={logo} alt='Melodify' className='auth-logo' />

      <div className='auth-card'>
        <h1 className='auth-title'>Log in to Melodify</h1>

        <div className='auth-social-btns'>
          <button className='btn-social'>
            <FaGoogle /> Continue with Google
          </button>
          <button className='btn-social'>
            <FaFacebook /> Continue with Facebook
          </button>
          <button className='btn-social'>
            <FaApple /> Continue with Apple
          </button>
        </div>

        <div className='auth-divider'>or</div>

        <form className='auth-form' onSubmit={(e) => e.preventDefault()}>
          <div className='input-group'>
            <label>Email or username</label>
            <input type='text' placeholder='Email or username' className='auth-input' />
          </div>

          <div className='input-group'>
            <label>Password</label>
            <input type='password' placeholder='Password' className='auth-input' />
          </div>

          <button className='btn-premium' style={{ width: '100%', padding: '14px', marginTop: '12px' }}>Log In</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          <a href='#' className='btn-ghost' style={{ fontSize: '0.9rem', textDecoration: 'underline' }}>Forgot your password?</a>
        </p>

        <div style={{ textAlign: 'center', width: '100%', padding: '24px 0', borderTop: '1px solid var(--glass-border)', marginTop: '24px' }}>
          <p style={{ fontSize: '1rem', color: 'var(--melodify-dim-white)' }}>
            Don't have an account?
            Don't have an account?
            <Link to='/signup' style={{
              color: 'var(--melodify-white)',
              fontWeight: 'bold',
              textDecoration: 'none',
              marginLeft: '8px',
              transition: 'color 0.2s'
            }} onMouseOver={(e) => e.target.style.color = 'var(--melodify-green)'} onMouseOut={(e) => e.target.style.color = 'var(--melodify-white)'}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
