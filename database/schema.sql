CREATE TABLE asteroids (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    nasa_jpl_url TEXT,
    absolute_magnitude_h NUMERIC(5, 2),
    estimated_diameter_min_m NUMERIC(10, 3), 
    estimated_diameter_max_m NUMERIC(10, 3),
    is_potentially_hazardous BOOLEAN NOT NULL,
    is_sentry_object BOOLEAN NOT NULL
);

CREATE TABLE close_approaches (
    id SERIAL PRIMARY KEY,
    asteroid_id VARCHAR(50) REFERENCES asteroids(id), 
    close_approach_date DATE NOT NULL,
    epoch_date_close_approach BIGINT NOT NULL,
    relative_velocity_kmh NUMERIC(15, 4),
    miss_distance_km NUMERIC(15, 4),
    orbiting_body VARCHAR(50) NOT NULL,
    
    UNIQUE(asteroid_id, epoch_date_close_approach)
);

CREATE INDEX idx_close_approach_date ON close_approaches(close_approach_date);