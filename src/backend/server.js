import express from 'express';
import cron from 'node-cron';
import pool from './db.js';
import { sync_historical_data, fetch_and_save_asteroids } from './sync.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const get_yesterday_str = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

const init_db = async () => {
    const res = await pool.query('SELECT COUNT(*) FROM asteroids');
    if (parseInt(res.rows[0].count) === 0) {
        console.log("Database is empty. Starting initial sync...");
        const start_date = '2025-12-01';
        await sync_historical_data(start_date);
    }
};

cron.schedule('1 0 * * *', async () => {
    const yesterday = get_yesterday_str();
    console.log(`Running daily cron job for ${yesterday}...`);
    await fetch_and_save_asteroids(yesterday, yesterday);
});

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await init_db();
});