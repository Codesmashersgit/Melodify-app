import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaTimes } from 'react-icons/fa';

const FeedbackModal = () => {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

    useEffect(() => {
        // Only show for logged in users
        if (!user) return;
        
        // Check local storage to see if they already submitted feedback
        const hasRated = localStorage.getItem('melodify_web_has_rated');
        if (hasRated === 'true') return;

        // Detect when user tries to close the tab
        const handleBeforeUnload = (e) => {
            if (localStorage.getItem('melodify_web_has_rated') !== 'true') {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome to show native prompt
                
                // If they cancel the prompt and stay, show our React modal
                setTimeout(() => {
                    setIsVisible(true);
                }, 500);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [user]);

    const handleSubmit = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/user/feedback`, {
                rating,
                comment,
                platform: 'web'
            }); // cookies are sent automatically
            localStorage.setItem('melodify_web_has_rated', 'true');
            setIsVisible(false);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            // Even if it fails, maybe let them try again later, so don't set local storage
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        // We do NOT set local storage here, so it will ask again next time they try to exit,
        // just like the user requested.
    };

    if (!isVisible) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle} className="fade-in">
                <button style={closeBtnStyle} onClick={handleClose}>
                    <FaTimes />
                </button>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '800' }}>Wait! Before you go...</h2>
                <p style={{ margin: '0 0 24px 0', color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
                    How was your experience with Melodify Web? Your feedback helps us improve.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            size={32}
                            color={(hoveredStar || rating) >= star ? '#ff6b35' : 'rgba(255,255,255,0.1)'}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            onClick={() => setRating(star)}
                            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                        />
                    ))}
                </div>

                <textarea
                    style={inputStyle}
                    placeholder="Tell us what you think! (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button style={cancelBtnStyle} onClick={handleClose}>
                        Just Exit
                    </button>
                    <button
                        style={{ ...submitBtnStyle, opacity: rating === 0 ? 0.5 : 1 }}
                        onClick={handleSubmit}
                        disabled={rating === 0}
                    >
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    );
};

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999999, // very high to be above everything
    backdropFilter: 'blur(5px)'
};

const modalStyle = {
    backgroundColor: '#111118',
    padding: '32px',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '450px',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    color: 'white'
};

const closeBtnStyle = {
    position: 'absolute',
    top: '24px',
    right: '24px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: '20px'
};

const inputStyle = {
    width: '100%',
    height: '100px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    color: 'white',
    fontSize: '15px',
    fontFamily: 'inherit',
    marginBottom: '24px',
    resize: 'none'
};

const cancelBtnStyle = {
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '15px'
};

const submitBtnStyle = {
    padding: '12px 24px',
    backgroundColor: '#1DB954',
    border: 'none',
    borderRadius: '24px',
    color: 'black',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '15px'
};

export default FeedbackModal;
