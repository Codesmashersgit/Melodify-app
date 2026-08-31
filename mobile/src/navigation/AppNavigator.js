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
import FeedbackScreen from '../screens/FeedbackScreen';
import PlayerBar from '../components/PlayerBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const commonScreens = (StackNav) => (
  <>
    <StackNav.Screen name="Album" component={AlbumScreen} />
    <StackNav.Screen name="Artist" component={ArtistScreen} />
    <StackNav.Screen name="Playlist" component={PlaylistScreen} />
    <StackNav.Screen name="SeeAll" component={SeeAllScreen} />
    <StackNav.Screen name="About" component={AboutScreen} />
    <StackNav.Screen name="Feedback" component={FeedbackScreen} />
  </>
);

const HomeStack = createNativeStackNavigator();
function HomeTab() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      {commonScreens(HomeStack)}
    </HomeStack.Navigator>
  );
}

const SearchStack = createNativeStackNavigator();
function SearchTab() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchScreen" component={SearchScreen} />
      {commonScreens(SearchStack)}
    </SearchStack.Navigator>
  );
}

const LibraryStack = createNativeStackNavigator();
function LibraryTab() {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="LibraryScreen" component={LibraryScreen} />
      {commonScreens(LibraryStack)}
    </LibraryStack.Navigator>
  );
}

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
          
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            paddingBottom: insets.bottom > 0 ? 0 : 5,
          },
          tabBarStyle: {
            backgroundColor: '#121212',
            borderTopWidth: 0,
            elevation: 10,
            height: 60 + (insets.bottom || 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
            paddingTop: 8,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeTab} />
        <Tab.Screen name="Search" component={SearchTab} />
        <Tab.Screen name="Library" component={LibraryTab} />
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