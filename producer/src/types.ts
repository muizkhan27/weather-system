export interface JobPayload {
  cities: string[];
  timestamp: string;
  type: 'manual' | 'scheduled';
}

export interface CityMetadata {
  name: string;
  latitude: number;
  longitude: number;
}

export interface EnvironmentConfig {
  redisUrl: string;
  scheduleInterval: number;
}