# Weather System - Next.js + Redis Queue + Scheduled Worker

A dockerized full-stack system demonstrating Redis-based job queuing, automated background scheduling, and weather data integration.

## Architecture

- **Next.js App** (`/app`) - Frontend + API routes (port 3000)
- **Worker** (`/worker`) - TypeScript consumer service for processing weather jobs
- **Producer** (`/producer`) - TypeScript scheduler service (enqueues jobs every 60 seconds)
- **Redis** - Job queue system
- **PostgreSQL** - Weather data persistence

## Features

### Dashboard (`/`)
- "Fetch Weather Now" button to manually trigger weather jobs
- Job history table showing manual and scheduled jobs with completion timestamps
- Auto-refreshes every 5 seconds for real-time updates
- Active navigation with visual feedback

### Weather Data (`/weather`)
- Real-time weather data for London, New York, Tokyo, and Cairo
- Temperature, wind speed, and last updated timestamps
- Auto-refreshes every 5 seconds for live data
- "Last Sync At" timestamp showing most recent update

### API Routes
- `POST /api/job` - Enqueue manual weather job
- `GET /api/weather` - Fetch stored weather data from PostgreSQL
- `GET /api/jobs` - Get job history with completion status

## Quick Start
- clone the repository and run this command on root
```bash
docker compose up --build
```

The system will be available at http://localhost:3000

## System Flow

1. Producer automatically enqueues weather jobs every 60 seconds
2. Manual jobs can be triggered via the dashboard
3. Worker consumes jobs from Redis queue
4. Worker fetches weather data from Open-Meteo API
5. Weather data is stored/updated in PostgreSQL
6. Frontend displays real-time weather information

## Environment Variables

All services use environment variables for configuration (set in docker-compose.yml):

### App Service
- `REDIS_URL=redis://redis:6379` - Redis connection for job queuing
- `DATABASE_URL=postgresql://postgres:password@postgres:5432/weather_db` - PostgreSQL connection

### Worker Service
- `REDIS_URL=redis://redis:6379` - Redis connection for consuming jobs
- `DATABASE_URL=postgresql://postgres:password@postgres:5432/weather_db` - PostgreSQL for data storage

### Producer Service
- `REDIS_URL=redis://redis:6379` - Redis connection for scheduling jobs

### PostgreSQL Service
- `POSTGRES_DB=weather_db` - Database name
- `POSTGRES_USER=postgres` - Database user
- `POSTGRES_PASSWORD=password` - Database password

## Database Schema

### weather_data
- `id` (SERIAL PRIMARY KEY)
- `city` (VARCHAR UNIQUE)
- `temperature` (DECIMAL)
- `wind_speed` (DECIMAL)
- `updated_at` (TIMESTAMP)

### job_history
- `id` (SERIAL PRIMARY KEY)
- `type` ('manual' | 'scheduled')
- `status` ('pending' | 'completed' | 'failed')
- `created_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP) - When job finished processing

## Technical Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, React Hooks
- **Backend**: Next.js API Routes, Node.js TypeScript services
- **Database**: PostgreSQL with connection pooling
- **Queue**: Redis for job management
- **External API**: Open-Meteo weather API
- **Containerization**: Docker Compose with multi-service orchestration

## Development

Each service can be developed independently:

```bash
# Next.js app
cd app && npm run dev

# Worker service
cd worker && npm run dev

# Producer service
cd producer && npm run dev
```

## Data Management

To clear all data and start fresh:

```bash
# Stop containers and remove data
docker compose down -v
docker compose up --build
```

Or clear data while running:

```bash
# Connect to database
docker exec -it weather-postgres psql -U postgres -d weather_db

```
