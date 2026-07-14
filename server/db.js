const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Connect using environment variable or fallback to local
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/melodify',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Helper to convert SQLite `?` to PostgreSQL `$1, $2`, etc.
function convertSql(sql) {
    let i = 1;
    // Replace ? outside of strings (basic regex, assumes no complex nested strings with ?)
    return sql.replace(/\?/g, () => `$${i++}`);
}

// Wrapper to emulate SQLite API with pg
const db = {
    serialize: (cb) => {
        cb();
    },
    run: (sql, params, callback) => {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        
        let pgSql = convertSql(sql);
        
        // Emulate this.lastID by appending RETURNING id to INSERTs
        if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
             if (!pgSql.toUpperCase().includes('RETURNING ID')) {
                 pgSql += ' RETURNING id';
             }
        }
        
        pool.query(pgSql, params)
            .then(res => {
                const context = {
                    changes: res.rowCount,
                    lastID: res.rows && res.rows.length > 0 ? res.rows[0].id : null
                };
                if (callback) callback.call(context, null);
            })
            .catch(err => {
                // SQLite error messages are sometimes checked for 'UNIQUE'
                if (err.code === '23505') { // Postgres unique violation code
                    err.message = 'UNIQUE constraint failed: ' + err.message;
                }
                if (callback) callback.call({}, err);
                else console.error('DB Run Error:', err);
            });
    },
    get: (sql, params, callback) => {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        const pgSql = convertSql(sql);
        pool.query(pgSql, params)
            .then(res => {
                if (callback) callback(null, res.rows[0]);
            })
            .catch(err => {
                if (callback) callback(err, null);
                else console.error('DB Get Error:', err);
            });
    },
    all: (sql, params, callback) => {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        const pgSql = convertSql(sql);
        pool.query(pgSql, params)
            .then(res => {
                if (callback) callback(null, res.rows);
            })
            .catch(err => {
                if (callback) callback(err, null);
                else console.error('DB All Error:', err);
            });
    }
};

pool.on('connect', () => {
    console.log('✅ Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize tables with PostgreSQL syntax
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        platform TEXT DEFAULT 'web',
        last_login_platform TEXT,
        reset_token TEXT,
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Add columns dynamically for migrations
    db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web'`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_platform TEXT`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP`, () => {});

    // Liked Songs table
    db.run(`CREATE TABLE IF NOT EXISTS liked_songs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        song_id TEXT NOT NULL,
        song_name TEXT,
        song_artist TEXT,
        song_image TEXT,
        song_preview TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, song_id)
    )`);

    // Playlists table
    db.run(`CREATE TABLE IF NOT EXISTS playlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Playlist Songs table
    db.run(`CREATE TABLE IF NOT EXISTS playlist_songs (
        id SERIAL PRIMARY KEY,
        playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
        song_id TEXT NOT NULL,
        song_name TEXT,
        song_artist TEXT,
        song_image TEXT,
        song_preview TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(playlist_id, song_id)
    )`);
    
    // Feedback table
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        comment TEXT,
        platform TEXT DEFAULT 'apk',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;
