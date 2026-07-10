const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

// --- PASSWORD RESET ---

// Email Transporter (Use Environment Variables in Production)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) {
            return res.json({ success: true, message: 'If an account exists, a reset link was sent.' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenExpiry = new Date(Date.now() + 3600000).toISOString();

        db.run(`UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`, [otp, tokenExpiry, user.id], async (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            console.log('\n--- PASSWORD RESET OTP ---');
            console.log(`OTP for ${email} is: ${otp}\n---------------------------\n`);

            const senderEmail = process.env.EMAIL_USER || 'your-email@gmail.com';

            try {
                await transporter.sendMail({
                    from: `"Melodify Support" <${senderEmail}>`,
                    to: email,
                    subject: 'Your Melodify Password Reset OTP',
                    html: `
                        <div style="font-family: Arial, sans-serif; background: #121212; color: #fff; padding: 40px; text-align: center;">
                            <h1 style="color: #ff6b00; font-size: 28px;">🎵 Melodify</h1>
                            <h2 style="color: #fff; margin-top: 20px;">Password Reset Request</h2>
                            <p style="color: #b3b3b3; font-size: 16px;">We received a request to reset your password. Here is your OTP:</p>
                            <div style="margin: 20px auto; padding: 20px 40px; background: #282828; display: inline-block; border-radius: 12px; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #ff6b00; border: 2px solid rgba(255,107,0,0.3);">
                                ${otp}
                            </div>
                            <p style="color: #b3b3b3; font-size: 14px; margin-top: 20px;">Enter this OTP on the reset password page.</p>
                            <p style="color: #777; font-size: 12px; margin-top: 30px;">This OTP will expire in 1 hour. If you did not request this, please ignore this email.</p>
                        </div>
                    `
                });
                res.json({ success: true, message: 'OTP sent to your email.' });
            } catch (mailErr) {
                console.error('Failed to send email:', mailErr.message);
                res.status(500).json({ error: `Failed to send email: ${mailErr.message}` });
            }
        });
    });
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword, email } = req.body;
    if (!token || !newPassword || !email) return res.status(400).json({ error: 'Email, OTP token and new password are required' });

    // Find the user by email AND verify the OTP token
    db.get(`SELECT id, reset_token, reset_token_expiry FROM users WHERE email = ? AND reset_token = ?`, [email, token], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Invalid OTP or Email' });
        
        // Check expiry
        if (new Date() > new Date(user.reset_token_expiry)) {
            return res.status(400).json({ error: 'Reset token has expired' });
        }

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.run(`UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`, [hashedPassword, user.id], function(err) {
                if (err) return res.status(500).json({ error: 'Failed to update password' });
                res.json({ success: true, message: 'Password has been successfully reset' });
            });
        } catch (hashErr) {
            res.status(500).json({ error: 'Server error' });
        }
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
