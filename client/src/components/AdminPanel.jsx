import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { FiUsers, FiSmartphone, FiMonitor, FiHeart, FiTrash2, FiLogOut } from 'react-icons/fi';
import './AdminPanel.css';

const ADMIN_SECRET_KEY = 'melodify_admin_2026';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secret, setSecret] = useState('');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (secret === ADMIN_SECRET_KEY) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin secret');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'x-admin-secret': ADMIN_SECRET_KEY };
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/stats`, { headers }),
        axios.get(`${API_BASE_URL}/admin/users`, { headers })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin data. Ensure server is running and updated.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}? This cannot be undone.`)) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
        headers: { 'x-admin-secret': ADMIN_SECRET_KEY }
      });
      setUsers(users.filter(u => u.id !== id));
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box">
          <h2>Melodify Admin</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Enter Admin Secret" 
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoFocus
            />
            {error && <p className="admin-error">{error}</p>}
            <button type="submit" className="admin-btn">Access Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h2>Admin Dashboard</h2>
        <button className="admin-logout" onClick={() => setIsAuthenticated(false)}>
          <FiLogOut /> Logout
        </button>
      </header>

      {error && <div className="admin-error-banner">{error}</div>}

      {loading && !stats ? (
        <div className="admin-loader">Loading stats...</div>
      ) : stats ? (
        <>
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-icon total"><FiUsers /></div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p>{stats.total_users || 0}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon apk"><FiSmartphone /></div>
              <div className="stat-info">
                <h3>App Installs (APK)</h3>
                <p>{stats.apk_users || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon web"><FiMonitor /></div>
              <div className="stat-info">
                <h3>Web Signups</h3>
                <p>{stats.web_users || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon likes"><FiHeart /></div>
              <div className="stat-info">
                <h3>Total Likes</h3>
                <p>{stats.total_liked_songs || 0}</p>
              </div>
            </div>
          </div>

          <div className="admin-table-container">
            <h3>Registered Users</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Platform</th>
                  <th>Joined</th>
                  <th>Stats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`platform-badge ${u.platform}`}>
                        {u.platform === 'apk' ? <FiSmartphone /> : <FiMonitor />} {u.platform?.toUpperCase() || 'WEB'}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className="stat-pill"><FiHeart size={12}/> {u.liked_songs_count}</span>
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteUser(u.id, u.name)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminPanel;
