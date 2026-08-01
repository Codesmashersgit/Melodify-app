import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const persistAuthSession = async (token, userData) => {
        if (token) {
            await AsyncStorage.setItem('melodify_token', token);
        }

        const prefsStr = await AsyncStorage.getItem('melodify_preferences');
        const preferences = prefsStr ? JSON.parse(prefsStr) : (userData?.preferences ?? null);
        setUser({ ...userData, preferences });
        return { success: true };
    };

    const checkSession = async () => {
        try {
            const token = await AsyncStorage.getItem('melodify_token');
            if (!token) {
                // Ensure splash screen shows for at least 2.5 seconds
                setTimeout(() => setLoading(false), 2500);
                return; // Early return - don't execute finally
            }

            const response = await axios.get(`${API_BASE_URL}/api/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const prefsStr = await AsyncStorage.getItem('melodify_preferences');
            const preferences = prefsStr ? JSON.parse(prefsStr) : null;

            setUser({ ...response.data.user, preferences });
            setLoading(false);
        } catch (error) {
            console.log('Session check failed:', error);
            await AsyncStorage.removeItem('melodify_token');
            setUser(null);
            // Ensure splash screen shows for at least 2.5 seconds even on error
            setTimeout(() => setLoading(false), 2500);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/login`, { email, password });
            if (response.data.token) {
                return await persistAuthSession(response.data.token, response.data.user);
            }
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/signup`, { name, email, password, platform: 'apk' });
            if (response.data.token) {
                return await persistAuthSession(response.data.token, response.data.user);
            }
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Signup failed' 
            };
        }
    };

    const socialAuth = async (payload) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/google-auth`, payload);
            if (response.data.token) {
                return await persistAuthSession(response.data.token, response.data.user);
            }
            return { success: false, error: 'Google authentication failed' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Google authentication failed'
            };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('melodify_token');
            setUser(null);
            // Optionally tell server to clear cookie if needed
            await axios.post(`${API_BASE_URL}/api/user/logout`);
        } catch (error) {
            console.log('Logout error', error);
        }
    };

    const updatePreferences = async (preferences) => {
        try {
            // Update local state and async storage
            const updatedUser = { ...user, preferences };
            setUser(updatedUser);
            // In a real app, you would also save to the backend.
            await AsyncStorage.setItem('melodify_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.log('Error updating preferences', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, socialAuth, logout, updatePreferences }}>
            {children}
        </AuthContext.Provider>
    );
};
