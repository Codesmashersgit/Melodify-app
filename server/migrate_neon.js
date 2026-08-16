const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_Mu6wXVC7qmhS@ep-flat-flower-azib5ukh.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" });
async function run() {
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255), google_id VARCHAR(255) UNIQUE, avatar_url VARCHAR(500), preferences TEXT[] DEFAULT ARRAY[]::TEXT[], created_at TIMESTAMP DEFAULT NOW())");
    console.log("users ok");
    await pool.query("CREATE TABLE IF NOT EXISTS liked_songs (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, song_id VARCHAR(255) NOT NULL, song_name VARCHAR(500), song_artist VARCHAR(500), song_image VARCHAR(500), song_preview VARCHAR(500), created_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id, song_id))");
    console.log("liked_songs ok");
    await pool.query("CREATE TABLE IF NOT EXISTS playlists (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, description TEXT, cover_image VARCHAR(500), created_at TIMESTAMP DEFAULT NOW())");
    console.log("playlists ok");
    await pool.query("CREATE TABLE IF NOT EXISTS playlist_songs (id SERIAL PRIMARY KEY, playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE, song_id VARCHAR(255) NOT NULL, song_name VARCHAR(500), song_artist VARCHAR(500), song_image VARCHAR(500), song_preview VARCHAR(500), added_at TIMESTAMP DEFAULT NOW(), UNIQUE(playlist_id, song_id))");
    console.log("playlist_songs ok");
    await pool.query("CREATE TABLE IF NOT EXISTS feedback (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, rating INTEGER, message TEXT, created_at TIMESTAMP DEFAULT NOW())");
    console.log("feedback ok");
    console.log("ALL TABLES CREATED SUCCESSFULLY!");
  } catch(e) { console.error("Error:", e.message); }
  await pool.end();
}
run();
