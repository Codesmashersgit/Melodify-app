import React from 'react'
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Nav from './components/Nav';
import Body from './components/Body';
import Signup from './components/Signup';
import Login from './components/Login';
import Album from './components/Album';
import Search from './components/Search';
import ArtistPage from './components/ArtistPage';
import FullPlayer from './components/FullPlayer';
import { usePlayback } from './context/PlaybackContext';


import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { HistoryProvider } from './context/HistoryContext';

import BottomNav from './components/BottomNav';

import SplashScreen from './components/SplashScreen';

function App() {
  return (
    <Router>
      <HistoryProvider>
        <SplashScreen />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Body />} />
            <Route path="search" element={<Search />} />
            <Route path="album/:id" element={<Album />} />
            <Route path="artist/:id" element={<ArtistPage />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
