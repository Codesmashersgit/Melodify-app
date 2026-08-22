import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../config';

const SignupScreen = ({ navigation }) => {
    const { signup, login, socialAuth } = useAuth();
    const insets = useSafeAreaInsets();
    const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
    const redirectUri = makeRedirectUri({ useProxy: true });

    const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    const [request, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        redirectUri,
        scopes: ['openid', 'profile', 'email'],
        responseType: 'token',
    }, discovery);

    useEffect(() => {
        WebBrowser.maybeCompleteAuthSession();
    }, []);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Email OTP Auth State
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');

    // Phone Auth State
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [phoneLoading, setPhoneLoading] = useState(false);

    const handleSignup = async () => {
        if (!emailOtpSent) {
            if (!name || !email) {
                Alert.alert('Error', 'Please enter your name and email');
                return;
            }
            setIsLoading(true);
            try {
                const res = await axios.post(`${API_BASE_URL}/api/user/send-signup-otp`, { email });
                if (res.data.success) {
                    setEmailOtpSent(true);
                }
            } catch (err) {
                Alert.alert('Error', err.response?.data?.error || 'Failed to send OTP code');
            } finally {
                setIsLoading(false);
            }
        } else {
            if (!password || !emailOtp || emailOtp.length !== 6) {
                Alert.alert('Error', 'Please enter a valid 6-digit OTP and your password');
                return;
            }
            setIsLoading(true);
            try {
                const res = await axios.post(`${API_BASE_URL}/api/user/signup-with-otp`, {
                    name, email, password, otp: emailOtp, platform: 'apk'
                });
                if (res.data.success) {
                    await login(email, password);
                    // Navigation will automatically happen based on user state in AppNavigator
                }
            } catch (err) {
                Alert.alert('Signup Failed', err.response?.data?.error || 'Invalid OTP or Signup Error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGoogleSignup = async () => {
        if (!request || !GOOGLE_CLIENT_ID) {
            Alert.alert('Google Sign-in Not Configured', 'Add EXPO_PUBLIC_GOOGLE_CLIENT_ID in your mobile env to enable Google sign-up.');
            return;
        }

        try {
            const result = await promptAsync();
            if (result?.type !== 'success' || !result?.params?.access_token) {
                Alert.alert('Google Sign-up Cancelled', 'Google sign-up was cancelled.');
                return;
            }

            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${result.params.access_token}` }
            });
            const userData = await userRes.json();

            const authResult = await socialAuth({
                accessToken: result.params.access_token,
                name: userData.name,
                email: userData.email,
                platform: 'apk'
            });

            if (authResult.success) {
                navigation.replace('Main');
            } else {
                Alert.alert('Google Signup Error', authResult.error || 'Google signup failed');
            }
        } catch (err) {
            Alert.alert('Google Signup Error', err?.message || 'Google signup failed');
        }
    };

    const handleAppleSignup = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/user/apple-auth`, { name: 'Apple User', email: 'user.apple@melodify.com', platform: 'apk' });
            if (res.data.token) {
                await AsyncStorage.setItem('melodify_token', res.data.token);
                navigation.replace('Main');
            }
        } catch (err) {
            Alert.alert("Apple Signup Error", err.response?.data?.error || "Apple signup failed");
        }
    };

    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) {
            Alert.alert("Invalid Phone Number", "Please enter a 10-digit mobile number.");
            return;
        }
        setPhoneLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/user/phone/send-otp`, { phone: `+91${phone}` });
            if (res.data.success) {
                setOtpSent(true);
            }
        } catch (err) {
            Alert.alert("Error", err.response?.data?.error || "Failed to send OTP");
        } finally {
            setPhoneLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 4) {
            Alert.alert("Invalid OTP", "Please enter a valid 4-digit code.");
            return;
        }
        setPhoneLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/user/phone/verify-otp`, { phone: `+91${phone}`, otp, platform: 'apk' });
            if (res.data.token) {
                await AsyncStorage.setItem('melodify_token', res.data.token);
                setShowPhoneModal(false);
                navigation.replace('Main');
            }
        } catch (err) {
            Alert.alert("Verification Failed", err.response?.data?.error || "Invalid OTP code");
        } finally {
            setPhoneLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={26} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>Create account</Text>
                        <Text style={styles.subtitle}>Sign up to start listening</Text>

                        <View style={styles.form}>
                            {!emailOtpSent ? (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>What's your name?</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="Enter your name"
                                            placeholderTextColor="#535353"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>What's your email?</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder="Enter your email"
                                            placeholderTextColor="#535353"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>6-Digit Verification Code</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={emailOtp}
                                            onChangeText={setEmailOtp}
                                            placeholder="Enter 6-digit OTP from your email"
                                            placeholderTextColor="#535353"
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Create a password</Text>
                                        <View style={styles.passwordContainer}>
                                            <TextInput
                                                style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                                                value={password}
                                                onChangeText={setPassword}
                                                placeholder="Enter your password"
                                                placeholderTextColor="#535353"
                                                secureTextEntry={!showPassword}
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#b3b3b3" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}

                            <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={isLoading}>
                                 {isLoading ? (
                                     <ActivityIndicator color="black" />
                                 ) : (
                                     <Text style={styles.signupButtonText}>{emailOtpSent ? "Verify & Create account" : "Send Verification Code"}</Text>
                                 )}
                             </TouchableOpacity>
                         </View>

                        {/* Social Buttons */}
                        <View style={styles.socialSection}>
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleSignup} activeOpacity={0.8}>
                                <Image 
                                    source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
                                    style={{ width: 20, height: 20, marginRight: 12 }} 
                                />
                                <Text style={styles.socialButtonText}>Sign up with Google</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.footerLink}>Log in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Phone Signup Modal */}
            <Modal visible={showPhoneModal} animationType="slide" transparent
                onRequestClose={() => { setShowPhoneModal(false); setOtpSent(false); }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <TouchableOpacity 
                            style={styles.closeModalBtn} 
                            onPress={() => { setShowPhoneModal(false); setOtpSent(false); }}
                        >
                            <Ionicons name="close" size={22} color="white" />
                        </TouchableOpacity>

                        <View style={styles.modalHeaderIcon}>
                            <Ionicons name="phone-portrait" size={32} color="#1DB954" />
                        </View>

                        <Text style={styles.modalTitle}>{otpSent ? 'Enter OTP' : 'Sign Up with Mobile'}</Text>
                        <Text style={styles.modalSubtitle}>
                            {otpSent ? `We sent a 4-digit code to +91 ${phone}` : 'Enter your mobile number to get started'}
                        </Text>

                        {!otpSent ? (
                            <View style={{ width: '100%', marginTop: 20 }}>
                                <View style={styles.phoneInputRow}>
                                    <View style={styles.countryCodeBox}>
                                        <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                                    </View>
                                    <TextInput
                                        style={styles.phoneInput}
                                        placeholder="Mobile Number"
                                        placeholderTextColor="#666"
                                        keyboardType="number-pad"
                                        maxLength={10}
                                        value={phone}
                                        onChangeText={setPhone}
                                    />
                                </View>
                                <TouchableOpacity 
                                    style={styles.modalActionBtn} 
                                    onPress={handleSendOtp}
                                    disabled={phoneLoading}
                                >
                                    {phoneLoading ? (
                                        <ActivityIndicator color="black" />
                                    ) : (
                                        <Text style={styles.modalActionBtnText}>Send Verification Code</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ width: '100%', marginTop: 20 }}>
                                <TextInput
                                    style={styles.otpInput}
                                    placeholder="• • • •"
                                    placeholderTextColor="#666"
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    value={otp}
                                    onChangeText={setOtp}
                                />
                                <TouchableOpacity 
                                    style={styles.modalActionBtn} 
                                    onPress={handleVerifyOtp}
                                    disabled={phoneLoading}
                                >
                                    {phoneLoading ? (
                                        <ActivityIndicator color="black" />
                                    ) : (
                                        <Text style={styles.modalActionBtnText}>Verify & Create Account</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setOtpSent(false)} style={{ marginTop: 16 }}>
                                    <Text style={{ color: '#1DB954', textAlign: 'center', fontWeight: '600' }}>Change Mobile Number</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#AAAAAA',
        marginBottom: 40,
        lineHeight: 22,
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    signupButton: {
        backgroundColor: '#1DB954',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        elevation: 4,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    signupButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    socialSection: {
        marginTop: 20,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: '#888888',
        paddingHorizontal: 16,
        fontSize: 13,
        fontWeight: '500',
    },
    socialButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1.5,
    },
    socialButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 12,
        fontSize: 15,
    },
    googleButton: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.15)',
    },
    appleButton: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.15)',
    },
    phoneButton: {
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        borderColor: 'rgba(29, 185, 84, 0.3)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#161622',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    closeModalBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeaderIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(29,185,84,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    modalSubtitle: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 12,
    },
    phoneInputRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    countryCodeBox: {
        height: 52,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    countryCodeText: {
        color: 'white',
        fontWeight: '600',
    },
    phoneInput: {
        flex: 1,
        height: 52,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        paddingHorizontal: 16,
        color: 'white',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    otpInput: {
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        color: 'white',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    modalActionBtn: {
        backgroundColor: '#1DB954',
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalActionBtnText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 48,
        marginBottom: 20,
    },
    footerText: {
        color: '#888888',
        fontSize: 14,
    },
    footerLink: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default SignupScreen;