import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaApple, FaMobileAlt, FaEye, FaEyeSlash, FaTimes, FaCheck } from 'react-icons/fa';
import logo from '../assets/melodify.png';
import axios from 'axios';
import API_BASE_URL from '../config';
import { auth } from '../firebaseConfig';
import * as firebaseAuth from 'firebase/auth';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // Phone Auth Modal State
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsAuthenticating(true);
        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userData = await userRes.json();
        const res = await axios.post(`${API_BASE_URL}/api/user/google-auth`, {
          name: userData.name,
          email: userData.email,
          platform: 'web'
        });
        if (res.data.success || res.data.token) {
          window.location.href = '/';
        }
      } catch (err) {
        setIsAuthenticating(false);
        console.error("Google Direct OAuth Error:", err);
        setError(err.response?.data?.error || "Google Login failed");
      }
    },
    onError: (errorResponse) => {
      setIsAuthenticating(false);
      console.error("Google Login Error:", errorResponse);
      setError("Google Login failed or was cancelled");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);
    const res = await login(email, password);
    if (res.success) {
      window.location.href = '/';
    } else {
      setIsAuthenticating(false);
      setError(res.message);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    googleLogin();
  };

  const [isAuthenticating, setIsAuthenticating] = useState(false);

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

        <div className='auth-card fade-in' style={{ position: 'relative', overflow: 'hidden', minHeight: '380px' }}>
          {isAuthenticating ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease-in-out'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                border: '4px solid rgba(29, 185, 84, 0.15)',
                borderTop: '4px solid #1DB954',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '24px',
                boxShadow: '0 0 20px rgba(29, 185, 84, 0.4)'
              }}></div>
              <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Authenticating...</h2>
              <p style={{ color: '#b3b3b3', fontSize: '14px' }}>Please wait while we log you into Melodify</p>
              <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              `}</style>
            </div>
          ) : (
            <>
              <h1 className='auth-title'>Welcome back</h1>
              <p className='auth-subtitle'>Log in to continue your music journey</p>

              <div className='auth-social-btns'>
                <button type="button" className='btn-social btn-google' id="login-google-btn" onClick={handleGoogleLogin}>
                  <FaGoogle className="social-icon" style={{ color: '#ea4335' }} /> Continue with Google
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
            </>
          )}
        </div>
      </div>

      {/* Mobile Phone Number Login Modal */}
      {showPhoneModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#161622',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '420px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }} className="fade-in">
            <div id="recaptcha-container"></div>
            <button
              onClick={() => { setShowPhoneModal(false); setOtpSent(false); setPhoneError(''); }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(29, 185, 84, 0.15)',
                color: '#1DB954',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px'
              }}>
                <FaMobileAlt />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 8px 0', color: '#fff' }}>
                {otpSent ? 'Enter OTP' : 'Continue with Phone'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                {otpSent ? (smsInfo || `We sent a 4-digit OTP to +91 ${phone}`) : 'Enter your mobile number to receive a verification code'}
              </p>
            </div>

            {phoneError && (
              <div style={{ color: '#ff4444', backgroundColor: 'rgba(255,68,68,0.1)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
                {phoneError}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <div style={{
                    padding: '14px 16px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#1DB954',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50px',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {phoneLoading ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="• • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '1.8rem',
                      letterSpacing: '12px',
                      textAlign: 'center',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#1DB954',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50px',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {phoneLoading ? 'Verifying...' : 'Verify & Log In'}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#1DB954',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginTop: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
