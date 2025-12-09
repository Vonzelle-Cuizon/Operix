require("dotenv").config();
const { Pool, Client } = require("pg");

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create a dedicated client for LISTEN/NOTIFY (separate from pool)
// Using Client instead of Pool for persistent connection needed for LISTEN
const listenClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test connection
pool.connect()
  .then(() => console.log("Connected to database"))
  .catch(err => console.error("Database connection error:", err));

module.exports = { pool, listenClient };
