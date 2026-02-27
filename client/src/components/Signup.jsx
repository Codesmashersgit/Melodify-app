import React from 'react'
import { Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import logo from '../assets/melodify.png';

const Signup = () => {
  return (
    <div className='auth-container'>
      <img src={logo} alt='Melodify' className='auth-logo' />

      <div className='auth-card'>
        <h1 className='auth-title'>Sign up to start listening on Melodify</h1>

        <div className='auth-social-btns'>
          <button className='btn-social'>
            <FaGoogle /> Signup with Google
          </button>
          <button className='btn-social'>
            <FaFacebook /> Signup with Facebook
          </button>
          <button className='btn-social'>
            <FaApple /> Signup with Apple
          </button>
        </div>

        <div className='auth-divider'>or</div>

        <form className='auth-form' onSubmit={(e) => e.preventDefault()}>
          <div className='input-group'>
            <label>Email address</label>
            <input type='email' placeholder='name@domain.com' className='auth-input' />
          </div>

          <button className='btn-premium' style={{ width: '100%', padding: '14px' }}>Next</button>
        </form>

        <div style={{ textAlign: 'center', width: '100%', padding: '24px 0', borderTop: '1px solid var(--glass-border)', marginTop: '24px' }}>
          <p style={{ fontSize: '1rem', color: 'var(--melodify-dim-white)' }}>
            Already have an account?
            <Link to='/login' style={{
              color: 'var(--melodify-white)',
              fontWeight: 'bold',
              textDecoration: 'none',
              marginLeft: '8px',
              transition: 'color 0.2s'
            }} onMouseOver={(e) => e.target.style.color = 'var(--melodify-green)'} onMouseOut={(e) => e.target.style.color = 'var(--melodify-white)'}>
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
