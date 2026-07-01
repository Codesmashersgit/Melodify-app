import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const NotificationsModal = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const notifications = [
    {
      id: 1,
      icon: 'musical-note',
      color: '#1DB954',
      title: 'New tracks added!',
      description: 'Fresh music awaits you today',
      time: '2 hours ago',
    },
    {
      id: 2,
      icon: 'heart',
      color: '#FF4444',
      title: 'Welcome to Melodify!',
      description: 'Discover millions of songs',
      time: '1 day ago',
    },
    {
      id: 3,
      icon: 'trending-up',
      color: '#00BFFF',
      title: 'Your favorite artist released new music',
      description: 'The Weeknd just dropped a new album',
      time: '3 days ago',
    },
    {
      id: 4,
      icon: 'notifications',
      color: '#FFB800',
      title: 'Complete your profile',
      description: 'Add a profile picture to get personalized recommendations',
      time: '1 week ago',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="notifications" size={24} color="#1DB954" />
              <Text style={styles.headerTitle}>Notifications</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
          {notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={styles.notificationCard}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: notif.color + '20' },
                ]}
              >
                <Ionicons
                  name={notif.icon}
                  size={24}
                  color={notif.color}
                />
              </View>

              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifDescription}>
                  {notif.description}
                </Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666666"
              />
            </TouchableOpacity>
          ))}
          </ScrollView>

          {/* Clear All Button */}
          <TouchableOpacity
            style={styles.clearButton}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.clearButtonText}>Clear All Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: '#12121a',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 8,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    paddingTop: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    gap: 12,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notifDescription: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: '#666666',
  },
  clearButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,68,68,0.2)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.5)',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF4444',
  },
});

export default NotificationsModal;
