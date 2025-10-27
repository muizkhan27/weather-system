'use client';

import { useState, useEffect } from 'react';
import { JobHistory } from '../types';

export default function Dashboard() {
  const [jobs, setJobs] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  };

  const handleFetchWeather = async () => {
    setLoading(true);
    try {
      await fetch('/api/job', { method: 'POST' });
      await fetchJobs();
    } catch (error) {
      console.error('Error triggering job:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Weather Dashboard</h1>
      
      <button 
        onClick={handleFetchWeather} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          marginBottom: '2rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : 'Fetch Weather Now'}
      </button>

      <h2>Recent Job History</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Type</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Created At</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Completed At</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{job.id}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{job.type}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{job.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {new Date(job.created_at).toLocaleString()}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {job.completed_at ? new Date(job.completed_at).toLocaleString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}