import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await pool.query(
      'SELECT id, type, status, created_at, completed_at FROM job_history ORDER BY created_at DESC LIMIT 10'
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching job history:', error);
    res.status(500).json({ message: 'Failed to fetch job history' });
  }
}