import express from 'express';
import cron from 'node-cron';
import pool from './db.js';
import { sync_historical_data, fetch_and_save_asteroids } from './sync.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/asteroids', async (req, res) => {
    const query = `
        SELECT 
            a.id,
            a.name, 
            a.nasa_jpl_url,
            a.is_potentially_hazardous,
            a.is_sentry_object,
            a.absolute_magnitude_h,
            a.estimated_diameter_min_m,
            a.estimated_diameter_max_m,
            TO_CHAR(c.close_approach_date, 'YYYY-MM-DD') as close_approach_date, 
            c.miss_distance_km, 
            c.relative_velocity_kmh
        FROM close_approaches c
        JOIN asteroids a ON c.asteroid_id = a.id
        ORDER BY c.close_approach_date ASC
    `;
    const result = await pool.query(query);        
    res.json(result.rows);
});

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