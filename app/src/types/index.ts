export interface WeatherData {
  id?: number;
  city: string;
  temperature: number;
  wind_speed: number;
  updated_at: string;
}

export interface JobPayload {
  cities: string[];
  timestamp: string;
  type: 'manual' | 'scheduled';
}

export interface JobHistory {
  id: number;
  type: 'manual' | 'scheduled';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}