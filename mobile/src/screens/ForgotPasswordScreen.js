import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from '../config';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendLink = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/forgot-password`, { email });
            if (response.data.success) {
                Alert.alert(
                    'Link Sent',
                    response.data.message || 'If an account exists, a reset link was sent.',
                    [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                );
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send reset link.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>Reset password</Text>
                <Text style={styles.subtitle}>
                    Enter your email address and we'll send you a link to reset your password.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor="#7a7a7a"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.resetButton, isLoading && styles.resetButtonDisabled]} 
                    onPress={handleSendLink} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <Text style={styles.resetButtonText}>Send Link</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    backButton: {
        marginTop: 50,
        marginLeft: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 30,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        color: '#b3b3b3',
        fontSize: 16,
        marginBottom: 30,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#282828',
        borderRadius: 4,
        padding: 14,
        color: 'white',
        fontSize: 16,
    },
    resetButton: {
        backgroundColor: '#1DB954',
        paddingVertical: 16,
        borderRadius: 50,
        alignItems: 'center',
        marginTop: 20,
    },
    resetButtonDisabled: {
        backgroundColor: '#1ed76080',
    },
    resetButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ForgotPasswordScreen;
