'use client';

import { useState, useEffect } from 'react';
import { WeatherData } from '../../types';

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch('/api/weather');
        const data = await response.json();
        setWeatherData(Array.isArray(data) ? data : []);
        
        if (data.length > 0) {
          const latest = data.reduce((latest: WeatherData, current: WeatherData) => 
            new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
          );
          setLastSync(latest.updated_at);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setWeatherData([]);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Weather Data</h1>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>City</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Temperature (°C)</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Wind Speed (km/h)</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((data, index) => (
            <tr key={index}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{data.city}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{data.temperature}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{data.wind_speed}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {new Date(data.updated_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {lastSync && (
        <p><strong>Last Sync At:</strong> {new Date(lastSync).toLocaleString()}</p>
      )}
    </div>
  );
}
