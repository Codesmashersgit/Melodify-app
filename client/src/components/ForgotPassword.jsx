import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/forgot-password`, { email });
      if (res.data.success) {
        setMessage(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-page' id="forgot-password-page">
      <div className='auth-container'>
        <div className='auth-header'>
          <h1 className='auth-title'>Reset your password</h1>
          <p className='auth-subtitle' style={{ color: '#b3b3b3', marginTop: '10px' }}>
            Enter your email address and we'll send you a link to get back into your account.
          </p>
        </div>

        <form className='auth-form' onSubmit={handleSubmit} id="forgot-password-form">
          <div className='form-group'>
            <input
              type='email'
              className='form-input'
              id='reset-email'
              placeholder=' '
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor='reset-email' className='floating-label'>Email address</label>
          </div>

          {error && <div className="error-message" style={{ color: '#f15e6c', marginBottom: '15px' }}>{error}</div>}
          {message && <div className="success-message" style={{ color: '#1DB954', marginBottom: '15px' }}>{message}</div>}

          <button type='submit' className='btn-primary' id="send-reset-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Link'}
          </button>
        </form>

        <div className='auth-footer'>
          <p className='auth-footer-text'>
            Remember your password?
            <Link to='/login' className='auth-footer-link' id="back-to-login-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
