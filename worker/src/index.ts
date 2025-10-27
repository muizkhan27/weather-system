import { createClient } from 'redis';
import { Pool } from 'pg';
const fetch = require('node-fetch');
import { JobPayload, CityCoordinates, WeatherApiResponse, WeatherData } from './types';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const cityCoordinates: Record<string, CityCoordinates> = {
  'London': { name: 'London', latitude: 51.5072, longitude: -0.1276 },
  'New York': { name: 'New York', latitude: 40.7128, longitude: -74.0060 },
  'Tokyo': { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  'Cairo': { name: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
};

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_data (
        id SERIAL PRIMARY KEY,
        city VARCHAR(100) UNIQUE NOT NULL,
        temperature DECIMAL(5,2) NOT NULL,
        wind_speed DECIMAL(5,2) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_history (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);

    
    await pool.query(`
      ALTER TABLE job_history 
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP
    `);

  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

async function fetchWeatherData(city: CityCoordinates): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true`;
    const response = await fetch(url);
    const data = await response.json() as WeatherApiResponse;
    const weatherData = {
      city: city.name,
      temperature: data.current_weather.temperature,
      wind_speed: data.current_weather.windspeed,
      updated_at: new Date().toISOString(),
    };
    return weatherData;
  } catch (error) {
    console.error(`Error fetching weather for ${city.name}:`, error);
    return null;
  }
}

async function upsertWeatherData(weatherData: WeatherData) {
  try {
    const result = await pool.query(`
      INSERT INTO weather_data (city, temperature, wind_speed, updated_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (city)
      DO UPDATE SET
        temperature = EXCLUDED.temperature,
        wind_speed = EXCLUDED.wind_speed,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `, [weatherData.city, weatherData.temperature, weatherData.wind_speed, weatherData.updated_at]);
  } catch (error) {
    console.error(`Error upserting weather data for ${weatherData.city}:`, error);
  }
}

async function processJob(jobData: JobPayload) {

  if (jobData.type === 'scheduled') {
    await pool.query(
      'INSERT INTO job_history (type, status, created_at) VALUES ($1, $2, $3)',
      [jobData.type, 'pending', new Date(jobData.timestamp)]
    );
  }

  try {
    for (const cityName of jobData.cities) {
      const cityCoords = cityCoordinates[cityName];
      if (!cityCoords) {
        continue;
      }
      const weatherData = await fetchWeatherData(cityCoords);
      if (weatherData) {
        await upsertWeatherData(weatherData);
      }
    }
    
    await pool.query(
      'UPDATE job_history SET status = $1, completed_at = $2 WHERE id = (SELECT id FROM job_history WHERE type = $3 AND status = $4 ORDER BY created_at DESC LIMIT 1)',
      ['completed', new Date(), jobData.type, 'pending']
    );
  } catch (error) {
    try {
      await pool.query(
        'UPDATE job_history SET status = $1, completed_at = $2 WHERE id = (SELECT id FROM job_history WHERE type = $3 AND status = $4 ORDER BY created_at DESC LIMIT 1)',
        ['failed', new Date(), jobData.type, 'pending']
      );
    } catch (dbError) {
      console.error('Failed to update job status:', dbError);
    }
  }
}

async function startWorker() {
  // Wait for database to be ready
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  await redisClient.connect();
  await initializeDatabase();

  while (true) {
    try {
      const job = await redisClient.brPop('weather-jobs', 0);
      if (job) {
        const jobData: JobPayload = JSON.parse(job.element);
        await processJob(jobData);
      }
    } catch (error) {
      console.error('Error processing job:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

startWorker().catch(console.error);