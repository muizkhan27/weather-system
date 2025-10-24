import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../src/lib/db';
import { WeatherData } from '../../src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await pool.query(
      'SELECT city, temperature, wind_speed, updated_at FROM weather_data ORDER BY updated_at DESC'
    );
    
    const weatherData: WeatherData[] = result.rows;
    
    res.status(200).json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
}