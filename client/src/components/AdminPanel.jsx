import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { FiUsers, FiSmartphone, FiMonitor, FiHeart, FiTrash2, FiLogOut, FiRefreshCw, FiMusic, FiSearch } from 'react-icons/fi';
import './AdminPanel.css';
import logo from '../assets/melodify.png';

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
  const [searchQuery, setSearchQuery] = useState('');

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
    setError('');
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
      console.error(err.response?.data || err);
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminToken(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card fade-in">
          <div className="admin-login-header">
            <img src={logo} alt="Melodify" className="admin-logo" />
            <h2>Admin Portal</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="admin-form">
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Admin Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="admin-alert error">{error}</div>}
            <button type="submit" className="admin-btn-primary" disabled={loading}>
              {loading ? <div className="spinner-small"></div> : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard fade-in">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="Melodify" />
          <span>Melodify Admin</span>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers /> Users & Analytics
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <FiHeart /> User Feedback
          </button>
        </nav>
        
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item text-danger" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{activeTab === 'users' ? 'Dashboard Overview' : 'User Feedback'}</h1>
            <p>Welcome back, Admin</p>
          </div>
          <button className="admin-btn-secondary" onClick={fetchAdminData} disabled={loading}>
            <FiRefreshCw className={loading ? 'spinning' : ''} /> Refresh Data
          </button>
        </header>

        {error && (
          <div className="admin-alert error" style={{margin: '0 32px 24px'}}>
            {error}
            <button onClick={fetchAdminData} className="retry-btn">Retry</button>
          </div>
        )}

        <div className="admin-content">
          {loading && !stats ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p>Loading world-class dashboard...</p>
            </div>
          ) : (
            <>
              {activeTab === 'users' && stats && (
                <>
                  {/* Stats Grid 2x2 */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon-wrapper users"><FiUsers /></div>
                      <div className="stat-info">
                        <h3>Total Users</h3>
                        <div className="stat-value">{parseInt(stats.total_users || 0)}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon-wrapper mobile"><FiSmartphone /></div>
                      <div className="stat-info">
                        <h3>App Installs</h3>
                        <div className="stat-value">{parseInt(stats.apk_users || 0)}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon-wrapper web"><FiMonitor /></div>
                      <div className="stat-info">
                        <h3>Web Users</h3>
                        <div className="stat-value">{parseInt(stats.web_users || 0)}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon-wrapper music"><FiMusic /></div>
                      <div className="stat-info">
                        <h3>Total Interactions</h3>
                        <div className="stat-value">{parseInt(stats.total_liked_songs || 0) + parseInt(stats.total_playlists || 0)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="admin-panel-section">
                    <div className="section-header">
                      <h2>User Directory</h2>
                      <div className="search-bar">
                        <FiSearch />
                        <input 
                          type="text" 
                          placeholder="Search users..." 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Platform</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center py-4">No users found.</td>
                            </tr>
                          ) : (
                            filteredUsers.map(user => (
                              <tr key={user.id}>
                                <td>
                                  <div className="user-cell">
                                    <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                                    <div>
                                      <div className="user-name">{user.name}</div>
                                      <div className="user-email">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`platform-badge ${user.platform || 'web'}`}>
                                    {user.platform === 'apk' ? <FiSmartphone /> : <FiMonitor />}
                                    {user.platform === 'apk' ? 'Mobile App' : 'Web App'}
                                  </span>
                                </td>
                                <td>{formatDate(user.created_at)}</td>
                                <td>
                                  {user.email !== 'sudhanshu.ok1802@gmail.com' && (
                                    <button 
                                      className="btn-icon delete" 
                                      onClick={() => handleDeleteUser(user.id, user.name)}
                                      title="Delete User"
                                    >
                                      <FiTrash2 />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'feedback' && (
                <div className="admin-panel-section">
                  <h2>User Feedback</h2>
                  {feedback.length === 0 ? (
                    <div className="empty-state">
                      <FiHeart size={48} color="rgba(255,255,255,0.2)" />
                      <p>No feedback received yet.</p>
                    </div>
                  ) : (
                    <div className="feedback-grid">
                      {feedback.map(item => (
                        <div key={item.id} className="feedback-card">
                          <div className="feedback-header">
                            <div className="feedback-user">
                              <div className="user-avatar small">{item.user_name?.charAt(0).toUpperCase()}</div>
                              <span>{item.user_name}</span>
                            </div>
                            <span className="feedback-date">{formatDate(item.created_at)}</span>
                          </div>
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={star <= item.rating ? 'star active' : 'star'}>★</span>
                            ))}
                          </div>
                          <p className="feedback-text">{item.comment || <i>No comment provided</i>}</p>
                          <span className={`platform-badge small ${item.platform || 'apk'}`}>
                            {item.platform === 'web' ? 'Web' : 'Mobile'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
