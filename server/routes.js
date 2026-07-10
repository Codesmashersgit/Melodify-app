const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'melodify_super_secret_key_123';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.melodify_token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
    
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const cookieOptions = {
    httpOnly: true,
    secure: true, // MUST be true for sameSite: 'none'
    sameSite: 'none', // Allows cross-origin cookies
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// --- AUTHENTICATION ---

router.post('/signup', async (req, res) => {
    const { name, email, password, platform } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userPlatform = platform === 'apk' ? 'apk' : 'web';
        db.run(`INSERT INTO users (name, email, password, platform) VALUES (?, ?, ?, ?)`, [name, email, hashedPassword, userPlatform], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            
            const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET, { expiresIn: '7d' });
            res.cookie('melodify_token', token, cookieOptions);
            res.json({ user: { id: this.lastID, name, email, platform: userPlatform }, token });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('melodify_token', token, cookieOptions);
        res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    });
});

router.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
    res.clearCookie('melodify_token');
    res.json({ success: true });
});

// --- LIKED SONGS ---

router.get('/liked-songs', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM liked_songs WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        // Format for the client frontend
        const tracks = rows.map(r => ({
            id: r.song_id,
            name: r.song_name,
            artist: r.song_artist,
            image: r.song_image,
            preview_url: r.song_preview
        }));
        res.json(tracks);
    });
});

router.post('/liked-songs', authenticateToken, (req, res) => {
    const { song_id, song_name, song_artist, song_image, song_preview } = req.body;
    db.run(
        `INSERT INTO liked_songs (user_id, song_id, song_name, song_artist, song_image, song_preview) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, song_id, song_name, song_artist, song_image, song_preview],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Song already liked' });
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

router.delete('/liked-songs/:song_id', authenticateToken, (req, res) => {
    db.run(`DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?`, [req.user.id, req.params.song_id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, changes: this.changes });
    });
});

// --- PLAYLISTS ---

router.get('/playlists', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

router.post('/playlists', authenticateToken, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Playlist name required' });
    
    db.run(`INSERT INTO playlists (user_id, name) VALUES (?, ?)`, [req.user.id, name], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: this.lastID, name });
    });
});

router.get('/playlists/:id', authenticateToken, (req, res) => {
    db.get(`SELECT * FROM playlists WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, playlist) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

        db.all(`SELECT * FROM playlist_songs WHERE playlist_id = ? ORDER BY added_at DESC`, [playlist.id], (err, songs) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ ...playlist, songs });
        });
    });
});

router.post('/playlists/:id/songs', authenticateToken, (req, res) => {
    const playlistId = req.params.id;
    const { song_id, song_name, song_artist, song_image, song_preview } = req.body;
    
    // Verify ownership
    db.get(`SELECT id FROM playlists WHERE id = ? AND user_id = ?`, [playlistId, req.user.id], (err, playlist) => {
        if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
        
        db.run(
            `INSERT INTO playlist_songs (playlist_id, song_id, song_name, song_artist, song_image, song_preview) VALUES (?, ?, ?, ?, ?, ?)`,
            [playlistId, song_id, song_name, song_artist, song_image, song_preview],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Song already in playlist' });
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ success: true, id: this.lastID });
            }
        );
    });
});

// --- ADMIN PANEL ROUTES ---

const authenticateAdmin = (req, res, next) => {
    const token = req.headers['x-admin-token'];
    if (!token) return res.status(403).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        next();
    });
};

router.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email !== 'sudhanshu.ok1802@gmail.com') return res.status(403).json({ error: 'Access denied: Not an admin email' });
    
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Admin account not found' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
        
        const adminToken = jwt.sign({ id: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, token: adminToken });
    });
});

router.get('/admin/stats', authenticateAdmin, (req, res) => {
    db.get(`SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN platform = 'web' THEN 1 ELSE 0 END) as web_users,
        SUM(CASE WHEN platform = 'apk' THEN 1 ELSE 0 END) as apk_users,
        (SELECT COUNT(*) FROM liked_songs) as total_liked_songs,
        (SELECT COUNT(*) FROM playlists) as total_playlists
    FROM users`, [], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(row);
    });
});

router.get('/admin/users', authenticateAdmin, (req, res) => {
    db.all(`SELECT 
        u.id, u.name, u.email, u.platform, u.created_at,
        COUNT(ls.id) as liked_songs_count,
        COUNT(DISTINCT p.id) as playlists_count
    FROM users u
    LEFT JOIN liked_songs ls ON ls.user_id = u.id
    LEFT JOIN playlists p ON p.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

router.delete('/admin/users/:id', authenticateAdmin, (req, res) => {
    db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, deleted: this.changes });
    });
});

module.exports = router;
