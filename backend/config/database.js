const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

const isLocalhost = connectionString && (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"));

const pool = new Pool({
  connectionString,
  ssl: connectionString && !isLocalhost ? { rejectUnauthorized: false } : false
});

const initializeDatabase = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      location VARCHAR(255),
      description TEXT,
      source VARCHAR(255),
      apply_url TEXT,
      category VARCHAR(255),
      posted_at VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_jobs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, job_id)
    );

    CREATE TABLE IF NOT EXISTS job_skills (
      id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      skill_name VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stored_filename VARCHAR(255) NOT NULL,
      original_filename VARCHAR(255) NOT NULL,
      content_type VARCHAR(255) NOT NULL,
      size_bytes INTEGER NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_skills (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_name VARCHAR(255) NOT NULL,
      UNIQUE(user_id, skill_name)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS one_current_resume_per_user
    ON resumes(user_id)
    WHERE is_current = 1;
  `;
  try {
    if (connectionString) {
      await pool.query(schema);
      console.log("PostgreSQL Database schema initialized successfully.");
    } else {
      console.warn("DATABASE_URL not set. Skipping schema initialization.");
    }
  } catch (err) {
    console.error("Database schema initialization failed:", err);
  }
};

initializeDatabase();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};