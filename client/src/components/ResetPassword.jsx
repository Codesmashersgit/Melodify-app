import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

const ResetPassword = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [location]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/reset-password`, {
        email,
        token: otpCode,
        newPassword,
      });
      if (res.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow} />
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <img src="/melodify-logo.png" alt="Melodify" style={{width: '40px', height: '40px', borderRadius: '8px'}} />
          <span style={styles.logoText}>Melodify</span>
        </div>

        {success ? (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Password Reset!</h2>
            <p style={styles.successMsg}>{success}</p>
          </div>
        ) : (
          <>
            <h1 style={styles.title}>Enter OTP</h1>
            <p style={styles.subtitle}>
              We sent a 6-digit OTP to <strong style={{color: '#1DB954'}}>{email || 'your email'}</strong>
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* OTP Boxes */}
              <div style={styles.otpRow} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      ...styles.otpInput,
                      ...(digit ? styles.otpFilled : {}),
                    }}
                  />
                ))}
              </div>

              {/* New Password */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.pwWrap}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    style={styles.input}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#888"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/><path d="M3 3l18 18" stroke="#888" strokeWidth="2"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#888"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={styles.input}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div style={styles.errorBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f15e6c" style={{flexShrink: 0}}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" style={{...styles.btn, ...(loading ? styles.btnDisabled : {})}} disabled={loading}>
                {loading ? (
                  <span style={styles.loadingWrap}><span style={styles.spinner} /> Resetting...</span>
                ) : 'Reset Password'}
              </button>
            </form>

            <div style={styles.footer}>
              <span style={{color: '#888', fontSize: '0.9rem'}}>Didn't get the OTP? </span>
              <Link to="/forgot-password" style={styles.resendLink}>Resend</Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(29,185,84,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(20,20,20,0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '3rem 2.5rem',
    width: '100%',
    maxWidth: '430px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
    animation: 'fadeUp 0.4s ease',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '2.5rem',
    justifyContent: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  title: {
    color: 'white',
    fontSize: '1.9rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: '0.93rem',
    margin: '0 0 2rem 0',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  otpRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  otpInput: {
    width: '50px',
    height: '58px',
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'white',
    outline: 'none',
    transition: 'all 0.2s',
    caretColor: '#1DB954',
  },
  otpFilled: {
    borderColor: '#1DB954',
    background: 'rgba(29,185,84,0.08)',
    boxShadow: '0 0 0 3px rgba(29,185,84,0.15)',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    color: '#ddd',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.3px',
  },
  pwWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '14px 16px',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(241, 94, 108, 0.1)',
    border: '1px solid rgba(241, 94, 108, 0.25)',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#f15e6c',
    fontSize: '0.88rem',
    fontWeight: '500',
  },
  btn: {
    background: '#1DB954',
    color: '#000',
    border: 'none',
    borderRadius: '50px',
    padding: '15px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '0.3rem',
    boxShadow: '0 8px 20px rgba(29,185,84,0.3)',
  },
  btnDisabled: {
    background: 'rgba(29,185,84,0.4)',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  loadingWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(0,0,0,0.2)',
    borderTop: '2px solid #000',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
  },
  resendLink: {
    color: '#1DB954',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginLeft: '4px',
  },
  successCard: {
    textAlign: 'center',
    padding: '1rem 0',
  },
  successIcon: {
    width: '70px',
    height: '70px',
    background: 'rgba(29,185,84,0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: '#1DB954',
    margin: '0 auto 1.5rem',
    border: '2px solid rgba(29,185,84,0.3)',
    animation: 'pop 0.4s ease',
  },
  successTitle: {
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: '0 0 1rem',
  },
  successMsg: {
    color: '#a0a0a0',
    fontSize: '1rem',
    lineHeight: 1.5,
  },
};

export default ResetPassword;
