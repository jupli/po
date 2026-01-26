import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

console.log("Testing connection...");
console.log("URL:", connectionString ? connectionString.replace(/:([^:@]+)@/, ':****@') : "undefined");

const pool = new Pool({ connectionString });

pool.connect()
  .then(client => {
    console.log("✅ Connected successfully!");
    client.release();
    pool.end();
  })
  .catch(err => {
    console.error("❌ Connection failed:", err.message);
    pool.end();
  });
