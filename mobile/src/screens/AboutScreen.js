import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const AboutScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();

    const openLink = (url) => {
        Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: async () => {
                    await logout();
                    navigation.replace('Login');
                }}
            ]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={{fontSize: 40, color: 'black', fontWeight: '800'}}>
                            {(user?.name || user?.email || 'M')[0].toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.creatorName}>{user?.name || 'User'}</Text>
                    <Text style={styles.creatorEmail}>{user?.email || 'user@melodify.com'}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Melodify Listener</Text>
                    </View>
                </View>

                {/* Preferences */}
                <Text style={styles.sectionTitle}>Your Vibe</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={[styles.iconBox, { backgroundColor: '#1DB954' }]}>
                            <Ionicons name="musical-notes" size={20} color="black" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowText}>Saved Preferences</Text>
                            <Text style={styles.subText}>
                                {user?.preferences?.length > 0 
                                    ? user.preferences.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ') 
                                    : 'Not set'}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(29, 185, 84, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
                            onPress={() => navigation.navigate('Preferences')}
                        >
                            <Ionicons name="pencil" size={14} color="#1DB954" style={{ marginRight: 4 }} />
                            <Text style={{ color: '#1DB954', fontSize: 13, fontWeight: 'bold' }}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Account Actions */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row} onPress={handleLogout}>
                        <View style={[styles.iconBox, { backgroundColor: '#ea4335' }]}>
                            <Ionicons name="log-out" size={20} color="white" />
                        </View>
                        <Text style={[styles.rowText, { color: '#ea4335' }]}>Log Out</Text>
                        <Ionicons name="chevron-forward" size={20} color="#555" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0b12',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#1DB954',
    },
    creatorName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    creatorEmail: {
        fontSize: 15,
        color: '#aaa',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#1DB954',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 13,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#1a1a24',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    rowText: {
        flex: 1,
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    subText: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginLeft: 50,
    },
    footerText: {
        textAlign: 'center',
        color: '#555',
        fontSize: 14,
        marginTop: 10,
        fontWeight: '500',
    }
});

export default AboutScreen;
