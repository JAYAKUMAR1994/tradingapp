import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    'Database connection string is missing. Set DATABASE_URL or SUPABASE_DB_URL in your environment.'
  );
}

export const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err);
});

export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}