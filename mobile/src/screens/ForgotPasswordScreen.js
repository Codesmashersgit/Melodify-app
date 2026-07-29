import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from '../config';

const ForgotPasswordScreen = ({ navigation }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP Verification, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSendOTP = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/forgot-password`, { 
                email: email.trim().toLowerCase() 
            });
            if (response.data.success) {
                Alert.alert('OTP Sent', 'A 6-digit verification code was sent to your email.');
                setStep(2);
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/verify-otp`, {
                email: email.trim().toLowerCase(),
                token: otp.trim()
            });
            if (response.data.success) {
                Alert.alert('Verified', 'OTP verified successfully. Please set a new password.');
                setStep(3);
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Invalid OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/reset-password`, {
                email: email.trim().toLowerCase(),
                token: otp.trim(),
                newPassword: newPassword
            });
            if (response.data.success) {
                Alert.alert(
                    'Success',
                    'Your password has been reset successfully.',
                    [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]
                );
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Password reset failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => {
                if (step > 1) {
                    setStep(step - 1);
                } else {
                    navigation.goBack();
                }
            }}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.content}>
                {step === 1 && (
                    <>
                        <Text style={styles.title}>Forgot password?</Text>
                        <Text style={styles.subtitle}>
                            Enter your email address and we'll send you an OTP to reset your password.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                placeholderTextColor="#7a7a7a"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]} 
                            onPress={handleSendOTP} 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="black" />
                            ) : (
                                <Text style={styles.resetButtonText}>Send OTP</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Text style={styles.title}>Verify OTP</Text>
                        <Text style={styles.subtitle}>
                            Please enter the 6-digit verification code sent to your email.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>OTP Code</Text>
                            <TextInput
                                style={[styles.input, { letterSpacing: 8, textAlign: 'center', fontSize: 20 }]}
                                placeholder="######"
                                placeholderTextColor="#7a7a7a"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]} 
                            onPress={handleVerifyOTP} 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="black" />
                            ) : (
                                <Text style={styles.resetButtonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.resendBtn} onPress={handleSendOTP} disabled={isLoading}>
                            <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
                        </TouchableOpacity>
                    </>
                )}

                {step === 3 && (
                    <>
                        <Text style={styles.title}>Create New Password</Text>
                        <Text style={styles.subtitle}>
                            Set a strong password for your Melodify account.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="At least 6 characters"
                                    placeholderTextColor="#7a7a7a"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#b3b3b3" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Re-type password"
                                placeholderTextColor="#7a7a7a"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]} 
                            onPress={handleResetPassword} 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="black" />
                            ) : (
                                <Text style={styles.resetButtonText}>Reset Password</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0b12',
    },
    backButton: {
        marginTop: 50,
        marginLeft: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: 20,
    },
    title: {
        color: 'white',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    subtitle: {
        color: '#a0a0a0',
        fontSize: 15,
        marginBottom: 30,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#e0e0e0',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: 14,
        color: 'white',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        color: 'white',
        fontSize: 16,
    },
    resetButton: {
        backgroundColor: '#1DB954',
        paddingVertical: 16,
        borderRadius: 50,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    resetButtonDisabled: {
        backgroundColor: 'rgba(29,185,84,0.4)',
    },
    resetButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendBtn: {
        alignItems: 'center',
        marginTop: 25,
    },
    resendText: {
        color: '#1DB954',
        fontSize: 14,
        fontWeight: '600',
    }
});

export default ForgotPasswordScreen;
