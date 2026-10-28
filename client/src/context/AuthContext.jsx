// import React, { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';
// import API_BASE_URL from '../config';

// // Configure axios to always send cookies
// axios.defaults.withCredentials = true;

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const checkSession = async () => {
//             try {
//                 const res = await axios.get(`${API_BASE_URL}/api/user/me`);
//                 setUser(res.data.user);
//             } catch (error) {
//                 setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         checkSession();
//     }, []);

//     const login = async (email, password) => {
//         try {
//             const res = await axios.post(`${API_BASE_URL}/api/user/login`, { email, password });
//             setUser(res.data.user);
//             return { success: true };
//         } catch (error) {
//             return { success: false, message: error.response?.data?.error || 'Login failed' };
//         }
//     };

//     const signup = async (name, email, password) => {
//         try {
//             const res = await axios.post(`${API_BASE_URL}/api/user/signup`, { name, email, password, platform: 'web' });
//             setUser(res.data.user);
//             return { success: true };
//         } catch (error) {
//             return { success: false, message: error.response?.data?.error || 'Signup failed' };
//         }
//     };

//     const logout = async () => {
//         try {
//             await axios.post(`${API_BASE_URL}/api/user/logout`);
//             setUser(null);
//         } catch (error) {
//             console.error('Logout failed', error);
//         }
//     };

//     return (
//         <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);


import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('melodify_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const checkSession = async () => {
            try {
                const storedToken = localStorage.getItem('melodify_token');
                const config = storedToken ? { headers: { Authorization: `Bearer ${storedToken}` } } : {};
                const res = await axios.get(`${API_BASE_URL}/api/user/me`, {
                    ...config,
                    validateStatus: (status) => status === 200 || status === 401
                });
                if (res.status === 200 && res.data?.user) {
                    setUser(res.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/user/login`,
                { email, password }
            );

            if (res.data?.token) {
                localStorage.setItem('melodify_token', res.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            }

            setUser(res.data.user);

            return { success: true };

        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Login failed'
            };
        }
    };


    const signup = async (name, email, password) => {
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/user/signup`,
                {
                    name,
                    email,
                    password,
                    platform: 'web'
                }
            );

            // Manual signup now returns success but requires explicit login
            return { success: true };

        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Signup failed'
            };
        }
    };


    const logout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/user/logout`);
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('melodify_token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };


    // ✅ NEW: Save user preferences
    const updatePreferences = async (preferences) => {
        try {
            setUser(prev => ({
                ...prev,
                preferences
            }));

            const storedToken = localStorage.getItem('melodify_token');
            const config = storedToken ? { headers: { Authorization: `Bearer ${storedToken}` } } : {};

            await axios.put(
                `${API_BASE_URL}/api/user/preferences`,
                {
                    preferences
                },
                config
            );
        } catch (error) {
            console.error(
                "Preference update failed",
                error
            );
            // Even if network fails or partial error, keep state updated for smooth navigation
        }
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                logout,
                updatePreferences,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);