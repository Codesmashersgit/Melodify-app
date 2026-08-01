const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined'
        ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
            ? 'http://localhost:5000'
            : window.location.origin)
        : 'https://melodify-app.onrender.com');

export default API_BASE_URL;
