export interface JobPayload {
  cities: string[];
  timestamp: string;
  type: 'manual' | 'scheduled';
}

export interface CityCoordinates {
  name: string;
  latitude: number;
  longitude: number;
}

export interface WeatherApiResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    time: string;
  };
}

export interface WeatherData {
  city: string;
  temperature: number;
  wind_speed: number;
  updated_at: string;
}