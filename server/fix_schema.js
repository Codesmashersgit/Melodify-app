const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_Mu6wXVC7qmhS@ep-flat-flower-azib5ukh.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" });
async function run() {
  try {
    // Drop and recreate users table with the correct schema matching routes.js
    await pool.query("DROP TABLE IF EXISTS playlist_songs CASCADE");
    await pool.query("DROP TABLE IF EXISTS liked_songs CASCADE");
    await pool.query("DROP TABLE IF EXISTS playlists CASCADE");
    await pool.query("DROP TABLE IF EXISTS feedback CASCADE");
    await pool.query("DROP TABLE IF EXISTS users CASCADE");
    console.log("Dropped old tables");

    await pool.query(`CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      platform TEXT DEFAULT 'web',
      last_login_platform TEXT,
      reset_token TEXT,
      reset_token_expiry TIMESTAMP,
      preferences TEXT DEFAULT '[]',
      phone TEXT,
      phone_otp TEXT,
      phone_otp_expiry TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log("users ok");

    await pool.query(`CREATE TABLE liked_songs (
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
    console.log("liked_songs ok");

    await pool.query(`CREATE TABLE playlists (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log("playlists ok");

    await pool.query(`CREATE TABLE playlist_songs (
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
    console.log("playlist_songs ok");

    await pool.query(`CREATE TABLE feedback (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      comment TEXT,
      platform TEXT DEFAULT 'web',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log("feedback ok");

    console.log("ALL DONE! Tables match routes.js schema perfectly.");
  } catch(e) { console.error("Error:", e.message); }
  await pool.end();
}
run();
