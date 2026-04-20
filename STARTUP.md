# Ferrari F1 Dashboard - Startup Instructions

## Prerequisites
- Node.js installed
- MongoDB Atlas account configured in `.env` file
- Port 3001 available for backend
- Port 5173 available for frontend (Vite default)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
node server.js
```
Should show:
```
✓ Connected to MongoDB Atlas
Backend server running on http://localhost:3001
```

### 3. Start Frontend (in another terminal)
```bash
npm run dev
```
Should show:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 4. Open Browser
Go to `http://localhost:5173`

## How It Works

1. **Select a Year** (2023, 2024, 2025, 2026)
   - Frontend calls `/api/openf1/ferrari-year/:year`
   - Backend checks MongoDB cache
   - If cached, returns instantly
   - If not cached, fetches from OpenF1 API and caches

2. **View Results**
   - Table shows all Ferrari session results for the year
   - Graph shows laps vs date correlation
   - Search filters by driver name

3. **Data Flow**
   ```
   Frontend → Backend → MongoDB (cache) + OpenF1 API → Results
   ```

## Troubleshooting

### Backend won't start
- Check port 3001 is not in use: `lsof -i :3001`
- Verify MongoDB URI in `.env` file
- Check internet connection for OpenF1 API access

### MongoDB connection fails
- Verify `.env` has correct `MONGODB_URI`
- Check MongoDB Atlas cluster is running
- Server will retry connection automatically

### No results showing
- Check browser console for errors
- Wait 10-20 seconds for first fetch (caches OpenF1 data)
- Check backend logs for fetch errors

### Results only showing 2 items
- First request triggers background fetch
- Wait a moment and refresh page
- Results are then cached in MongoDB

## Backend API Endpoints

- `GET /health` - Health check
- `GET /api/openf1/ferrari-year/:year` - Get all Ferrari results for a year
- `GET /api/openf1/sessions?year=YYYY` - Get all sessions for year
- `GET /api/openf1/drivers` - Get drivers for session
- `GET /api/openf1/session-result` - Get result for driver

## Development Notes

- All Ferrari results are cached in MongoDB for instant subsequent loads
- OpenF1 API requests are made server-side to avoid CORS issues
- Frontend data fetching is simplified to single endpoint call
- Background caching means first request may show empty, second shows results
