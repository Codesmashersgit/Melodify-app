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
        const checkSession = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/user/me`);
                setUser(res.data.user);
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

            setUser(res.data.user);

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
            setUser(null);

        } catch (error) {
            console.error('Logout failed', error);
        }
    };


    // ✅ NEW: Save user preferences
    const updatePreferences = async (preferences) => {
        try {

            setUser(prev => ({
                ...prev,
                preferences
            }));

            await axios.put(
                `${API_BASE_URL}/api/user/preferences`,
                {
                    preferences
                }
            );
        } catch (error) {
            console.error(
                "Preference update failed",
                error
            );

            throw error;
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
                updatePreferences
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);