import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/melodify.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic
  };

  return (
    <div className='auth-container'>
      {/* Animated background orbs */}
      <div className="auth-bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="auth-content">
        <img src={logo} alt='Melodify' className='auth-logo' />

        <div className='auth-card fade-in'>
          <h1 className='auth-title'>Welcome back</h1>
          <p className='auth-subtitle'>Log in to continue your music journey</p>

          <div className='auth-social-btns'>
            <button className='btn-social btn-google' id="login-google-btn">
              <FaGoogle className="social-icon" /> Continue with Google
            </button>
            <button className='btn-social btn-facebook' id="login-facebook-btn">
              <FaFacebook className="social-icon" /> Continue with Facebook
            </button>
            <button className='btn-social btn-apple' id="login-apple-btn">
              <FaApple className="social-icon" /> Continue with Apple
            </button>
          </div>

          <div className='auth-divider'>or</div>

          <form className='auth-form' onSubmit={handleSubmit}>
            <div className={`input-group-premium ${focusedField === 'email' || email ? 'focused' : ''}`}>
              <input
                type='text'
                id='login-email'
                className='auth-input-premium'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                required
              />
              <label htmlFor='login-email' className='floating-label'>Email or username</label>
              <div className="input-highlight"></div>
            </div>

            <div className={`input-group-premium ${focusedField === 'password' || password ? 'focused' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                id='login-password'
                className='auth-input-premium'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                required
              />
              <label htmlFor='login-password' className='floating-label'>Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                id="login-password-toggle"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <div className="input-highlight"></div>
            </div>

            <div className="auth-options">
              <label className="remember-me" htmlFor="remember-me-toggle">
                <input
                  type="checkbox"
                  id="remember-me-toggle"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Remember me</span>
              </label>
              <Link to='#' className='forgot-link' id="forgot-password-link">Forgot password?</Link>
            </div>

            <button className='btn-cta-premium' id="login-submit-btn" type="submit">
              <span>Log In</span>
              <div className="btn-shimmer"></div>
            </button>
          </form>

          <div className='auth-footer-section'>
            <p className='auth-footer-text'>
              Don't have an account?
              <Link to='/signup' className='auth-footer-link' id="signup-link">
                Sign up for Melodify
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
