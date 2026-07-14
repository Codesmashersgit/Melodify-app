import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { FiUsers, FiSmartphone, FiMonitor, FiHeart, FiTrash2, FiLogOut } from 'react-icons/fi';
import './AdminPanel.css';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminToken, setAdminToken] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/admin/login`, { email, password });
      if (res.data.success) {
        setAdminToken(res.data.token);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'x-admin-token': adminToken };
      const [statsRes, usersRes, feedbackRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/user/admin/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/user/admin/users`, { headers }),
        axios.get(`${API_BASE_URL}/api/user/admin/feedback`, { headers })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFeedback(feedbackRes.data);
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
      await axios.delete(`${API_BASE_URL}/api/user/admin/users/${id}`, {
        headers: { 'x-admin-token': adminToken }
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
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="admin-error">{error}</p>}
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
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
                <h3>Playlists</h3>
                <p>{stats.totalPlaylists || 0}</p>
              </div>
            </div>
          </div>

          <div className="admin-tabs" style={{display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
            <button 
              className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} 
              onClick={() => setActiveTab('users')}
              style={{background: 'none', border: 'none', borderBottom: activeTab === 'users' ? '2px solid #1DB954' : '2px solid transparent', color: activeTab === 'users' ? 'white' : '#888', padding: '10px 0', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s'}}
            >
              Registered Users
            </button>
            <button 
              className={`admin-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`} 
              onClick={() => setActiveTab('feedback')}
              style={{background: 'none', border: 'none', borderBottom: activeTab === 'feedback' ? '2px solid #1DB954' : '2px solid transparent', color: activeTab === 'feedback' ? 'white' : '#888', padding: '10px 0', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s'}}
            >
              App Feedback
            </button>
          </div>

          {activeTab === 'users' ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Signup Platform</th>
                    <th>Last Login</th>
                    <th>Joined</th>
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
                      <td>
                        {u.last_login_platform ? (
                           <span className={`platform-badge ${u.last_login_platform}`}>
                            {u.last_login_platform === 'apk' ? <FiSmartphone /> : <FiMonitor />} {u.last_login_platform?.toUpperCase()}
                          </span>
                        ) : '-'}
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
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
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Platform</th>
                    <th>Rating</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map(f => (
                    <tr key={f.id}>
                      <td>{new Date(f.created_at).toLocaleString()}</td>
                      <td>
                        <strong>{f.name}</strong><br/>
                        <span style={{fontSize: '0.8rem', color: '#888'}}>{f.email}</span>
                      </td>
                      <td>
                        <span className={`platform-badge ${f.platform}`}>
                          {f.platform === 'apk' ? <FiSmartphone /> : <FiMonitor />} {f.platform?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {Array(5).fill(0).map((_, i) => (
                          <span key={i} style={{color: i < f.rating ? '#1DB954' : '#444'}}>★</span>
                        ))}
                      </td>
                      <td>{f.comment || '-'}</td>
                    </tr>
                  ))}
                  {feedback.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No feedback received yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default AdminPanel;
