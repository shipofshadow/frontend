# iScholar Frontend (React + Vite)

iScholar is an intelligent scholarship prequalification and application management system. This repository contains the frontend SPA built with React, TypeScript, and Vite. It enables students to apply for scholarships and track statuses, and provides administrators with dashboards, analytics, and management tools.

## Tech Stack
- React 19 + TypeScript
- Vite 6 (dev server and build)
- React Router (routing)
- Redux Toolkit (state management)
- Bootstrap 5 + custom styles (UI)
- Charts: ApexCharts, Recharts, Chart.js via react wrappers
- Auth: JWT (access/refresh) with context provider
- Realtime: socket.io-client (optional usage)

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+ (or pnpm/yarn if you prefer)

### Install
```bash
npm install
```

### Environment Variables
Create a `.env` file in the project root (same folder as `package.json`). Supported variables:

```bash
VITE_API_BASE_URL=https://your-api-base-url
VITE_REACT_APP_WS_URL=wss://your-websocket-url
```

- `VITE_API_BASE_URL` is required for all API requests (used in `src/config.ts`).
- `VITE_REACT_APP_WS_URL` is optional if realtime features are used.

### Run Dev Server
```bash
npm run dev
```
Vite will start at `http://localhost:5173` (configured in `vite.config.ts`).

### Typecheck & Build
```bash
npm run build
```
Outputs to the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## Project Structure (high level)
```
/ (repo root)
  index.html             # SPA entry html
  vite.config.ts         # Vite config (host, port, define)
  src/
    main.tsx             # React root, mounts <App />
    App.tsx              # App providers (Redux, Router, Guard, Notifications)
    config.ts            # Exposes API_BASE_URL and APP_WS_URL from env
    context/
      AuthContext.tsx    # JWT auth context/provider with token refresh
      NotificationContext.tsx  # toast/notifications provider
    components/          # Shared UI components (Guard, SessionModal, etc.)
    routes/              # Route configuration (AppRoutes)
    store/               # Redux slices and store configuration
    hooks/
      useDashboardData.ts  # Dashboard data fetching + CSV export
    utils/               # Helpers (e.g., JWT utilities)
```

## Key Concepts

- Authentication is handled by `AuthContext`:
  - Persists `token`/`refresh_token` in `localStorage`
  - Fetches `profile/me` and, for students, `profile/scholarship/summary`
  - Automatically refreshes access token if expiring soon
  - Exposes `login`, `logout`, `refreshUser`, `isAdmin`, `isStudent`

- API configuration lives in `src/config.ts`:
  - `API_BASE_URL` and `APP_WS_URL` read from Vite env

- Routing:
  - `App.tsx` uses React Router with a `Guard` component protecting routes
  - `AppRoutes` defines public and protected routes (see `src/routes/AppRoutes`)

- State management:
  - `store/slices` for Redux Toolkit slices
  - App wrapped in `<Provider store={store}>`

- Dashboard data fetching (`useDashboardData`):
  - Fetches multiple endpoints in parallel under `/api/reports/dashboard/*`
  - Builds query strings from filter options
  - Provides `refetch`, `exportData` (CSV export), and error/loading states

- UI & Charts:
  - Bootstrap 5 via `react-bootstrap`
  - Charting via `react-apexcharts`, `recharts`, and `react-chartjs-2`

## Development Notes

- Vite server config (`vite.config.ts`):
  - Host: `0.0.0.0`
  - Port: `5173` (strict)
  - Allowed host: `ischolar.xyz`
  - Defines `__APP_VERSION__` = `1.0.0`

- Assets and base HTML in `index.html` (includes Font Awesome and custom stylesheet via CDN).

- ESLint configured via `eslint.config.js` with React, React Hooks, and TypeScript ESLint plugins.

## Common Tasks

- Update API base URL: set `VITE_API_BASE_URL` in `.env`.
- Add a protected page: add the route in `routes/AppRoutes`, wrap with `Guard` if needed.
- Access auth in components: `const { user, isAdmin, isStudent, login, logout } = useAuth()`.
- Trigger dashboard export: call `exportData()` from `useDashboardData` result.

## Scripts
- `npm run dev`: Start dev server
- `npm run build`: Type-check and build to `dist/`
- `npm run preview`: Preview built app
- `npm run lint`: Run ESLint

## Deployment
- Build with `npm run build` and serve the `dist/` folder with any static server or CDN (e.g., Nginx, Netlify, Vercel). Ensure `VITE_API_BASE_URL` is set appropriately in the build environment.

## License
This project is licensed under the terms in `LICENSE`.
