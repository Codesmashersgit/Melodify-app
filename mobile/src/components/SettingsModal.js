import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { usePlayback } from '../context/PlaybackContext';

const SettingsModal = ({ visible, onClose }) => {
  const { logout } = useAuth();
  const { isPlaying, togglePlay } = usePlayback();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'account',
          icon: 'person',
          label: 'Account',
          color: '#2ECC71',
          hasSwitch: false,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'audio',
          icon: 'volume-high',
          label: 'Audio Quality',
          color: '#9B59B6',
          hasSwitch: false,
        },
        {
          id: 'notifications',
          icon: 'notifications',
          label: 'Notifications',
          color: '#FF9500',
          hasSwitch: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'privacy',
          icon: 'shield',
          label: 'Privacy',
          color: '#3498DB',
          hasSwitch: false,
        },
        {
          id: 'private_mode',
          icon: 'lock-closed',
          label: 'Private Mode',
          color: '#E74C3C',
          hasSwitch: true,
          value: privateMode,
          onToggle: setPrivateMode,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'about',
          icon: 'information-circle',
          label: 'About Melodify',
          color: '#34495E',
          hasSwitch: false,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    if (isPlaying) {
      await togglePlay();
    }
    await logout();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.settingItem,
                      itemIndex < section.items.length - 1 &&
                        styles.settingItemBorder,
                    ]}
                    activeOpacity={item.hasSwitch ? 1 : 0.7}
                  >
                    <View style={styles.settingLeft}>
                      <View
                        style={[
                          styles.iconBox,
                          { backgroundColor: item.color + '30' },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={item.color}
                        />
                      </View>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                    </View>

                    {item.hasSwitch ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#444', true: '#1DB954' }}
                        thumbColor={item.value ? '#FFFFFF' : '#888'}
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#666666"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Melodify v1.0.0</Text>
            <Text style={styles.versionSubText}>Made with 🎵 by Melodify Team</Text>
          </View>
        </ScrollView>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#FF4444" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  versionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
  },
  versionSubText: {
    fontSize: 11,
    color: '#555555',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,68,68,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF4444',
  },
});

export default SettingsModal;
