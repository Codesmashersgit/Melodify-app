import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/forgot-password`, { email });
      if (res.data.success) {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <img src="/melodify-logo.png" alt="Melodify" style={{width: '40px', height: '40px', borderRadius: '8px'}} />
          <span style={styles.logoText}>Melodify</span>
        </div>

        <h1 style={styles.title}>Forgot password?</h1>
        <p style={styles.subtitle}>Enter your email and we'll send you an OTP to reset your password.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              style={{...styles.input, ...(error ? styles.inputError : {})}}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
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
              <span style={styles.loadingWrap}>
                <span style={styles.spinner} />
                Sending OTP...
              </span>
            ) : 'Send OTP'}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.backLink}>
            ← Back to Login
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
  bg: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(29,185,84,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(20,20,20,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '3rem 2.5rem',
    width: '100%',
    maxWidth: '420px',
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
    margin: '0 0 0.6rem 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: '0.95rem',
    margin: '0 0 2rem 0',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
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
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '14px 16px',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  inputError: {
    borderColor: 'rgba(241, 94, 108, 0.5)',
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
    marginTop: '2rem',
    textAlign: 'center',
  },
  backLink: {
    color: '#b3b3b3',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
};

export default ForgotPassword;
