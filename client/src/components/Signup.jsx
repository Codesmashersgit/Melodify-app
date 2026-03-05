import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import logo from '../assets/melodify.png';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [focusedField, setFocusedField] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic
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
          <h1 className='auth-title'>Create your account</h1>
          <p className='auth-subtitle'>Sign up to start listening for free</p>

          <div className='auth-social-btns'>
            <button className='btn-social btn-google' id="signup-google-btn">
              <FaGoogle className="social-icon" /> Sign up with Google
            </button>
            <button className='btn-social btn-facebook' id="signup-facebook-btn">
              <FaFacebook className="social-icon" /> Sign up with Facebook
            </button>
            <button className='btn-social btn-apple' id="signup-apple-btn">
              <FaApple className="social-icon" /> Sign up with Apple
            </button>
          </div>

          <div className='auth-divider'>or</div>

          <form className='auth-form' onSubmit={handleSubmit}>
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

            <button
              className='btn-cta-premium'
              id="signup-submit-btn"
              type="submit"
              disabled={!agreedToTerms}
            >
              <span>Create Account</span>
              <div className="btn-shimmer"></div>
            </button>
          </form>

          <div className='auth-footer-section'>
            <p className='auth-footer-text'>
              Already have an account?
              <Link to='/login' className='auth-footer-link' id="login-link">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
