import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaFacebook, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/melodify.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
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

          {error && <div className="auth-error" style={{color: '#ff4444', textAlign: 'center', marginBottom: '1rem'}}>{error}</div>}

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
              <Link to='/forgot-password' style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#b3b3b3'}>
                Forgot your password?
              </Link>
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
