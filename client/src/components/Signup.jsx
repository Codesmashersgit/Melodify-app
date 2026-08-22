import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaApple, FaMobileAlt, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import logo from '../assets/melodify.png';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useGoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  // Email Verification State
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Phone Auth Modal State
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [smsInfo, setSmsInfo] = useState('');

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userData = await userRes.json();
        const res = await axios.post(`${API_BASE_URL}/api/user/google-auth`, {
          accessToken: tokenResponse.access_token,
          name: userData.name,
          email: userData.email,
          platform: 'web'
        });
        if (res.data.success || res.data.token) {
          window.location.href = '/';
        }
      } catch (err) {
        console.error("Google Direct OAuth Error:", err);
        setError(err.response?.data?.error || "Google Signup failed");
      }
    },
    onError: (errorResponse) => {
      console.error("Google Signup Error:", errorResponse);
      setError("Google Signup failed or was cancelled");
    }
  });

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: '#ff4444' },
      { score: 2, label: 'Fair', color: '#ffaa00' },
      { score: 3, label: 'Good', color: '#88cc00' },
      { score: 4, label: 'Strong', color: '#1DB954' },
    ];
    return levels[score];
  }, [password]);

  const passwordsMatch = confirmPassword && password === confirmPassword;

  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOtpSent) {
      if (!username || !email) return setError("Name and Email are required");
      setEmailLoading(true);
      setError('');
      try {
        const res = await axios.post(`${API_BASE_URL}/api/user/send-signup-otp`, { email });
        if (res.data.success) {
          setEmailOtpSent(true);
        }
      } catch (err) {
        setError(err.response?.data?.details || err.response?.data?.error || "Failed to send verification code");
      } finally {
        setEmailLoading(false);
      }
    } else {
      if (!passwordsMatch) return setError("Passwords do not match");
      if (!emailOtp || emailOtp.length !== 6) return setError("Please enter a valid 6-digit code");
      if (!agreedToTerms) return setError("Please agree to the Terms of Service");
      
      setEmailLoading(true);
      setError('');
      try {
        const res = await axios.post(`${API_BASE_URL}/api/user/signup-with-otp`, {
          name: username, email, password, otp: emailOtp, platform: 'web'
        });
        if (res.data.success) {
          setIsSignupSuccess(true);
          // Reload to log them in automatically and jump straight to preferences
          setTimeout(() => window.location.href = '/preferences', 1500);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Signup failed. Invalid OTP code.");
      } finally {
        setEmailLoading(false);
      }
    }
  };

  const handleGoogleSignup = () => {
    setError('');
    googleSignup();
  };

  const handleAppleSignup = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/apple-auth`, { name: 'Apple User', email: 'user.apple@melodify.com', platform: 'web' });
      if (res.data.success) {
        window.location.href = '/';
      }
    } catch (err) {
      setError("Apple Signup failed");
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      return;
    }
    setPhoneError('');
    setPhoneLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/phone/send-otp`, { phone: `+91${phone}` });
      if (res.data.success) {
        setOtpSent(true);
        if (res.data.smsNote) {
          setSmsInfo(`SMS note: ${res.data.smsNote}. Test OTP: ${res.data.otp}`);
        } else {
          setSmsInfo(`OTP sent via SMS to +91 ${phone}`);
        }
      }
    } catch (err) {
      setPhoneError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setPhoneError("Please enter valid 4-digit OTP");
      return;
    }
    setPhoneLoading(true);
    setPhoneError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/phone/verify-otp`, { phone, otp, platform: 'web' });
      if (res.data.success) {
        setShowPhoneModal(false);
        window.location.href = '/';
      }
    } catch (err) {
      setPhoneError(err.response?.data?.error || "Invalid OTP Code");
    } finally {
      setPhoneLoading(false);
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
          {isSignupSuccess ? (
            <div className="signup-success-message" style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(29, 185, 84, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                <FaCheck style={{ color: '#1DB954', fontSize: '40px' }} />
              </div>
              <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '24px' }}>Account Created!</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px', fontSize: '16px', lineHeight: '1.5' }}>
                You are successfully signed up.<br/>Please login here to continue.
              </p>
              <button 
                className='auth-submit-btn'
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <h1 className='auth-title'>Create your account</h1>
              <p className='auth-subtitle'>Sign up to start listening for free</p>

              <div className='auth-social-btns'>
                <button type="button" className='btn-social btn-google' id="signup-google-btn" onClick={handleGoogleSignup}>
                  <FcGoogle size={22} style={{ marginRight: '10px' }} /> Sign up with Google
                </button>
              </div>

              <div className='auth-divider'>or</div>

          {error && <div className="auth-error" style={{color: '#ff4444', textAlign: 'center', marginBottom: '1rem'}}>{error}</div>}

          <form className='auth-form' onSubmit={handleSubmit}>
            {!emailOtpSent ? (
              <>
                {/* Email */}
                <div className={`input-group-premium ${focusedField === 'email' || email ? 'focused' : ''}`}>
                  <input
                    type='email'
                    id='signup-email'
                    className='auth-input-premium'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    required
                  />
                  <label htmlFor='signup-email' className='floating-label'>Email address</label>
                  <div className="input-highlight"></div>
                </div>

                {/* Username */}
                <div className={`input-group-premium ${focusedField === 'username' || username ? 'focused' : ''}`}>
                  <input
                    type='text'
                    id='signup-username'
                    className='auth-input-premium'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField('')}
                    required
                  />
                  <label htmlFor='signup-username' className='floating-label'>Create a username</label>
                  <div className="input-highlight"></div>
                </div>
              </>
            ) : (
              <>
                {/* OTP */}
                <div className={`input-group-premium ${focusedField === 'otp' || emailOtp ? 'focused' : ''}`}>
                  <input
                    type='text'
                    id='signup-otp'
                    className='auth-input-premium'
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField('')}
                    maxLength="6"
                    required
                  />
                  <label htmlFor='signup-otp' className='floating-label'>6-Digit Verification Code</label>
                  <div className="input-highlight"></div>
                </div>

                {/* Password */}
                <div className={`input-group-premium ${focusedField === 'password' || password ? 'focused' : ''}`}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='signup-password'
                    className='auth-input-premium'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    required
                  />
                  <label htmlFor='signup-password' className='floating-label'>Create a password</label>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    id="signup-password-toggle"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <div className="input-highlight"></div>
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      ></div>
                    </div>
                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}

                {/* Confirm Password */}
                <div className={`input-group-premium ${focusedField === 'confirm' || confirmPassword ? 'focused' : ''}`}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id='signup-confirm-password'
                    className='auth-input-premium'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField('')}
                    required
                  />
                  <label htmlFor='signup-confirm-password' className='floating-label'>Confirm password</label>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    id="signup-confirm-toggle"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {passwordsMatch && (
                    <span className="match-check"><FaCheck /></span>
                  )}
                  <div className="input-highlight"></div>
                </div>

                {/* Terms */}
                <label className="terms-checkbox" htmlFor="terms-toggle">
                  <input
                    type="checkbox"
                    id="terms-toggle"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span className="custom-checkbox"></span>
                  <span className="terms-text">
                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                  </span>
                </label>
              </>
            )}

            <button
              className='btn-cta-premium'
              id="signup-submit-btn"
              type="submit"
              disabled={emailLoading || (emailOtpSent && !agreedToTerms)}
            >
              <span>{emailLoading ? "Please wait..." : emailOtpSent ? "Verify & Create Account" : "Send Verification Code"}</span>
              <div className="btn-shimmer"></div>
            </button>
          </form>

          <div className='auth-footer-section'>
            <p className='auth-footer-text'>
              Already have an account?
              <Link to='/login' className='auth-footer-link' id="login-link">
                Log in to Melodify
              </Link>
            </p>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Mobile Phone Number Signup Modal */}
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
                {otpSent ? 'Enter OTP' : 'Sign Up with Phone'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                {otpSent ? (smsInfo || `We sent a 4-digit OTP to +91 ${phone}`) : 'Enter your mobile number to get started'}
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
                  {phoneLoading ? 'Verifying...' : 'Verify & Create Account'}
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

export default Signup
