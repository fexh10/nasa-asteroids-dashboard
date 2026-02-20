import axios from 'axios';
import pool from './db.js';

const format_date = (d) => d.toISOString().split('T')[0];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function fetch_and_save_asteroids(start_date, end_date) {
    const api_key = process.env.NASA_API_KEY || 'DEMO_KEY';
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=${api_key}`;

    try {
        console.log(`Fetching data from ${start_date} to ${end_date}...`);
        const res = await axios.get(url);
        const data = res.data.near_earth_objects;

        for (const date in data) {
            for (const ast of data[date]) {
                await pool.query(`
                    INSERT INTO asteroids (
                        id, name, nasa_jpl_url, absolute_magnitude_h, 
                        estimated_diameter_min_m, estimated_diameter_max_m, 
                        is_potentially_hazardous, is_sentry_object
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (id) DO NOTHING;
                `, [
                    ast.id, ast.name, ast.nasa_jpl_url, ast.absolute_magnitude_h,
                    ast.estimated_diameter.meters.estimated_diameter_min,
                    ast.estimated_diameter.meters.estimated_diameter_max,
                    ast.is_potentially_hazardous_asteroid, ast.is_sentry_object
                ]);

                const approach = ast.close_approach_data[0];
                if (approach) {
                    await pool.query(`
                        INSERT INTO close_approaches (
                            asteroid_id, close_approach_date, epoch_date_close_approach, 
                            relative_velocity_kmh, miss_distance_km, orbiting_body
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (asteroid_id, epoch_date_close_approach) DO NOTHING;
                    `, [
                        ast.id, approach.close_approach_date, approach.epoch_date_close_approach,
                        approach.relative_velocity.kilometers_per_hour,
                        approach.miss_distance.kilometers, approach.orbiting_body
                    ]);
                }
            }
        }
        console.log(`Successfully saved chunk: ${start_date} to ${end_date}`);
    } catch (err) {
        console.error(`Fetch error for ${start_date} - ${end_date}:`, err.message);
    }
}

export async function sync_historical_data(start_str) {
    console.log(`Starting historical sync from ${start_str}...`);
    
    let current_date = new Date(start_str);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    while (current_date <= yesterday) {
        let chunk_end = new Date(current_date);
        chunk_end.setDate(chunk_end.getDate() + 7);

        if (chunk_end > yesterday) {
            chunk_end = yesterday;
        }

        const start_str = format_date(current_date);
        const end_str = format_date(chunk_end);

        await fetch_and_save_asteroids(start_str, end_str);
        await sleep(1000);

        current_date.setDate(current_date.getDate() + 8);
    }
    
    console.log("Historical sync completed.");
}