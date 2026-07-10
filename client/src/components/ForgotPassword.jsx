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
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
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
