import { NextApiRequest, NextApiResponse } from 'next';
import client from '../../src/lib/redis';
import pool from '../../src/lib/db';
import { JobPayload } from '../../src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await client.connect();
    
    const cities = ['London', 'New York', 'Tokyo', 'Cairo'];
    const jobPayload: JobPayload = {
      cities,
      timestamp: new Date().toISOString(),
      type: 'manual',
    };

    await client.lPush('weather-jobs', JSON.stringify(jobPayload));
  
    await pool.query(
      'INSERT INTO job_history (type, status, created_at) VALUES ($1, $2, $3)',
      ['manual', 'pending', new Date()]
    );

    await client.disconnect();
    
    res.status(200).json({ message: 'Job enqueued successfully' });
  } catch (error) {
    console.error('Error enqueuing job:', error);
    res.status(500).json({ message: 'Failed to enqueue job' });
  }
}