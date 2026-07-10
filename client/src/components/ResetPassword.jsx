import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset token.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    if (!token) {
      setError("No token found. Please use the link sent to your email.");
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/reset-password`, { token, newPassword });
      if (res.data.success) {
        setMessage(res.data.message);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-page' id="reset-password-page">
      <div className='auth-container'>
        <div className='auth-header'>
          <h1 className='auth-title'>Create new password</h1>
          <p className='auth-subtitle' style={{ color: '#b3b3b3', marginTop: '10px' }}>
            Please enter your new password below.
          </p>
        </div>

        <form className='auth-form' onSubmit={handleSubmit} id="reset-password-form">
          <div className='form-group password-group'>
            <input
              type={showPassword ? "text" : "password"}
              className='form-input'
              id='new-password'
              placeholder=' '
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
            <label htmlFor='new-password' className='floating-label'>New password</label>
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className='form-group password-group'>
            <input
              type={showPassword ? "text" : "password"}
              className='form-input'
              id='confirm-new-password'
              placeholder=' '
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
            <label htmlFor='confirm-new-password' className='floating-label'>Confirm new password</label>
          </div>

          {error && <div className="error-message" style={{ color: '#f15e6c', marginBottom: '15px' }}>{error}</div>}
          {message && <div className="success-message" style={{ color: '#1DB954', marginBottom: '15px' }}>{message}</div>}

          <button type='submit' className='btn-primary' id="reset-submit-btn" disabled={loading || !token}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className='auth-footer'>
          <p className='auth-footer-text'>
            <Link to='/login' className='auth-footer-link'>
              Return to Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
