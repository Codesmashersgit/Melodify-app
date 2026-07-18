import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

// Screens
import SplashScreen from '../components/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AlbumScreen from '../screens/AlbumScreen';
import ArtistScreen from '../screens/ArtistScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import SeeAllScreen from '../screens/SeeAllScreen';
import AboutScreen from '../screens/AboutScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import PlayerBar from '../components/PlayerBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Library') {
              iconName = focused ? 'library' : 'library-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#0a0a0f',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.05)',
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 6,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            elevation: 10,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
      </Tab.Navigator>
    </View>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        {/* Show Splash Screen during loading */}
        {loading ? (
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{
              animationEnabled: false,
            }}
          />
        ) : user ? (
          user.preferences && user.preferences.length > 0 ? (
            /* Main App Stack (Logged in and preferences set) */
            <Stack.Group>
              <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Album"
              component={AlbumScreen}
              options={{
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="Artist"
              component={ArtistScreen}
              options={{
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="Playlist"
              component={PlaylistScreen}
              options={{
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="SeeAll"
              component={SeeAllScreen}
              options={{
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{
                animationEnabled: true,
              }}
            />
            </Stack.Group>
          ) : (
            /* Preferences Onboarding Stack */
            <Stack.Group>
              <Stack.Screen 
                name="Preferences" 
                component={PreferencesScreen} 
                options={{ animationEnabled: true }} 
              />
            </Stack.Group>
          )
        ) : (
          /* Auth Stack (Not logged in) */
          <Stack.Group>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                animationEnabled: false,
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                animationEnabled: true,
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
      {/* Global Player Bar - visible across all screens if user is logged in */}
      {user && !loading && <PlayerBar />}
    </NavigationContainer>
  );
}