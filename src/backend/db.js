import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const db_url = process.env.DATABASE_URL;
const is_neon = db_url && db_url.includes('neon.tech');

const pool = new Pool({
    connectionString: db_url,
    ssl: is_neon ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
    console.log('connnected to postgres db');
});

pool.on('error', (err) => {
    console.error('error while connecting to postgres db', err);
    process.exit(-1);
});

export default pool;