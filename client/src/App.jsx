import React from 'react';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Nav from './components/Nav';
import Body from './components/Body';
import Signup from './components/Signup';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Album from './components/Album';
import Search from './components/Search';
import ArtistPage from './components/ArtistPage';
import FullPlayer from './components/FullPlayer';
import LikedSongs from './components/LikedSongs';
import ShowAll from './components/ShowAll';
import PlaylistPage from './components/PlaylistPage';
import AdminPanel from './components/AdminPanel';
import Preferences from './components/Preferences';
import { usePlayback } from './context/PlaybackContext';


import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { HistoryProvider } from './context/HistoryContext';
import { useAuth } from './context/AuthContext';
import FeedbackModal from './components/FeedbackModal';

import BottomNav from './components/BottomNav';

import SplashScreen from './components/SplashScreen';

import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SplashScreen />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Only redirect to preferences if user has NEVER set them (null from server)
  // user.preferences === null means column was null in DB (brand new user, never visited preferences)
  // user.preferences === [] means user visited but selected nothing (don't force redirect)
  const neverSetPreferences = user.preferences === null || user.preferences === undefined;
  if (neverSetPreferences && location.pathname !== '/preferences') {
    return <Navigate to="/preferences" replace />;
  }

  return children;
};

// Redirect logged-in users away from auth pages
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'white' }}>Loading...</div>;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <HistoryProvider>
        <SplashScreen />
        <FeedbackModal />
        <Routes>
          {/* Protected: requires login */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Body />} />
            <Route path="search" element={<Search />} />
            <Route path="album/:id" element={<Album />} />
            <Route path="artist/:id" element={<ArtistPage />} />
            <Route path="liked" element={<LikedSongs />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="show-all/:category" element={<ShowAll />} />
            <Route path="playlist/:id" element={<PlaylistPage />} />
          </Route>

          {/* Public only: redirect to home if already logged in */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

          {/* Admin: has its own internal auth */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Catch all: redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HistoryProvider>
    </Router>
  );
}

function Layout() {
  const { isExpanded } = usePlayback();

  return (
    <div className='app-container'>
      <FullPlayer />
      <div className='sidebar-container'>
        <Sidebar />
      </div>

      <main className='main-view'>
        <Nav />
        <Outlet />
      </main>

      {!isExpanded && (
        <div className='player-bar'>
          <Footer />
          <BottomNav />
        </div>
      )}
    </div>
  )
}


export default App
