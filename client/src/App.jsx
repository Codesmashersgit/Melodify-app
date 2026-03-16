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

import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { HistoryProvider } from './context/HistoryContext';

function App() {
  return (
    <Router>
      <HistoryProvider>
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

      <div className='player-bar'>
        <Footer />
      </div>
    </div>
  )
}

export default App
