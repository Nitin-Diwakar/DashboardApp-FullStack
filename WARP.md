# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Backend (Node.js/Express)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server (requires .env file with MONGO_URI)
npm start

# The backend runs on http://localhost:5000 by default
```

### Frontend (React/TypeScript/Vite)
```bash
# Navigate to frontend directory
cd "frontend/Dashboard Application"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build for Docker
npm run build:docker

# Run linting
npm run lint

# Preview production build
npm run preview
```

### Full-Stack Development
```bash
# Root level dependency management
npm install

# Run backend and frontend simultaneously (manual coordination required)
# Terminal 1: cd backend && npm start
# Terminal 2: cd "frontend/Dashboard Application" && npm run dev
```

### Docker Deployment
```bash
# Build and run frontend container
cd "frontend/Dashboard Application"
docker compose up --build

# Frontend will be available at http://localhost:3000
```

### Testing and Quality
```bash
# Frontend linting
cd "frontend/Dashboard Application"
npm run lint

# Currently no automated tests are configured
# Backend uses basic error handling without formal test suite
```

## Architecture Overview

### Project Structure
This is a **full-stack Smart Irrigation Dashboard** with a clear separation between frontend and backend:

```
DashboardApp-FullStack/
├── backend/                    # Node.js/Express API server
│   ├── index.js               # Express server entry point
│   ├── routes/sensorData.js   # API routes for sensor data
│   └── models/SensorData.js   # MongoDB schema definitions
├── frontend/Dashboard Application/  # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route-based page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React Context providers
│   │   ├── utils/            # Utility functions and data processors
│   │   └── layouts/          # Application layout components
│   └── Dockerfile            # Container configuration
└── package.json              # Root-level dependencies
```

### Technology Stack

**Backend:**
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **API**: RESTful API serving sensor data
- **CORS**: Enabled for cross-origin requests

**Frontend:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Custom component system built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theming
- **State Management**: React Context (SettingsContext, AuthContext) + TanStack Query for server state
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization

### Data Flow Architecture

**Core Data Pipeline:**
1. **MongoDB** stores historical sensor readings (moisture, temperature, humidity, battery levels)
2. **Express API** (`/api/sensor-data`) fetches and normalizes data from multiple schema formats
3. **useDashboardData** hook processes raw data into structured formats for different time periods
4. **React Components** consume processed data for real-time dashboard updates

**Key Data Processing:**
- **Historical Data**: Raw sensor readings transformed into time-series format
- **Daily Averaging**: Multiple readings per day averaged for trend analysis
- **Monthly Aggregation**: Weekly averages within each month for long-term patterns
- **Real-time Updates**: 30-second refresh cycle for live sensor data

**State Management Pattern:**
- **Settings**: Irrigation thresholds, sensor configurations, and crop profiles stored in localStorage and managed by SettingsContext
- **Authentication**: User session management via AuthContext
- **Server State**: TanStack Query for API data caching and synchronization
- **Component State**: Local state for UI interactions and form handling

### Smart Irrigation Logic

**Rule-Based Decision System:**
The application implements sophisticated rule-based algorithms for irrigation recommendations:

1. **Priority System**: Emergency checks → Weather overrides → Moisture-based logic → Optimization
2. **Multi-Sensor Analysis**: Combines readings from 2 soil moisture sensors at different depths
3. **Weather Integration**: OpenWeather API integration prevents unnecessary irrigation during rain
4. **Predictive Analytics**: Trend analysis estimates time-to-threshold for proactive irrigation

**Key Algorithm Components:**
- **Health Score Calculation**: Weighted scoring (60% moisture, 25% temperature, 15% humidity)
- **Irrigation Triggers**: Configurable thresholds per sensor with alert and optimal ranges
- **Water Efficiency Tracking**: Calculates daily usage and conservation metrics
- **Confidence Scoring**: AI recommendations include confidence levels and reasoning

### Component Architecture

**Page-Level Components:**
- `Dashboard`: Main irrigation dashboard with live data and recommendations
- `Settings`: Configuration interface for thresholds, crop profiles, and system settings
- `DataSheet`: Historical data export and analysis tools
- `Schedule`: Irrigation scheduling and automation controls
- `Activities`: Historical irrigation events and system logs

**Core Dashboard Components:**
- `FieldHealthOverview`: Overall field condition scoring and health metrics
- `IrrigationRecommendations`: AI-driven irrigation decision engine with confidence scoring
- `WeatherInsights`: Weather impact analysis and 48-hour forecasting
- `SensorCards`: Real-time sensor readings with status indicators
- `SoilConditionAnalysis`: Advanced soil health analytics and trend analysis

**Data Processing Utilities:**
- `dataProcessors.ts`: Time-series data transformation and aggregation
- `dateHelpers.ts`: Date formatting and time-zone handling for India locale
- `useDashboardData.ts`: Central data fetching hook with error handling and retry logic

### Key Integration Points

**MongoDB Schema Flexibility:**
- Schema allows both old and new field formats (`temperature`/`Temp`, `humidity`/`Humidity`)
- `strict: false` mode accommodates evolving sensor data structures
- Collection name: `sensorData` (case-sensitive)

**Environment Configuration:**
- Backend requires `MONGO_URI` environment variable
- Frontend uses Vite environment variables for API endpoints
- Production builds optimize for Docker deployment

**Error Handling Strategy:**
- **Backend**: Console logging with structured error responses
- **Frontend**: Retry logic with exponential backoff, graceful fallbacks for missing data
- **Data Validation**: Type-safe interfaces and runtime validation for sensor data

### Development Patterns

**Custom Hooks Pattern:**
- `useDashboardData`: Centralized data fetching with loading states and error handling
- `useChartFilters`: Chart filtering and time period selection logic
- `use-toast`: Notification system for user feedback

**Context Provider Pattern:**
- Settings managed through React Context with localStorage persistence
- Authentication state shared across protected routes
- Theme management for dark/light mode switching

**Component Composition:**
- Radix UI primitives wrapped in custom components for consistent styling
- Compound component patterns for complex UI elements (charts, cards, forms)
- TypeScript interfaces ensure type safety across component boundaries