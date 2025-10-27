import { createClient } from 'redis';
import { JobPayload, CityMetadata, EnvironmentConfig } from './types';

const config: EnvironmentConfig = {
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  scheduleInterval: 60000, // 60 seconds
};

const cities: CityMetadata[] = [
  { name: 'London', latitude: 51.5072, longitude: -0.1276 },
  { name: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
];

const redisClient = createClient({
  url: config.redisUrl,
});

async function enqueueWeatherJob() {
  try {
    const jobPayload: JobPayload = {
      cities: cities.map(city => city.name),
      timestamp: new Date().toISOString(),
      type: 'scheduled',
    };

    await redisClient.lPush('weather-jobs', JSON.stringify(jobPayload));
    
    console.log(`Scheduled job enqueued at ${jobPayload.timestamp}`);
  } catch (error) {
    console.error('Error enqueuing scheduled job:', error);
  }
}

async function startProducer() {
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  await redisClient.connect();

  await enqueueWeatherJob();
  setInterval(async () => {
    await enqueueWeatherJob();
  }, config.scheduleInterval);
}

startProducer().catch(console.error);