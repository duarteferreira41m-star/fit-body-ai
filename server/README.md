# Fit Body AI Backend

## Setup
- Copy `server/.env.example` to `server/.env` and fill values
- Create the database and update `DATABASE_URL`
- Install dependencies: `npm install` in `server/`
- Generate Prisma client: `npm run prisma:generate`
- Run migrations: `npm run prisma:migrate`
- Start API: `npm run dev`

## API overview
- `POST /api/auth/register` { email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/auth/google` (redirect)
- `GET /api/auth/google/callback` (OAuth callback)
- `GET/PUT /api/profile`
- `GET/POST /api/workouts`
- `GET/POST /api/diet`
- `GET/POST /api/measurements`
- `GET/POST /api/photos` (multipart form-data with `photo` + `view`)
- `GET/POST /api/exercises`
- `GET /api/analysis`
- `POST /api/analysis/run` { photoIds? }

## Notes
- Uploads are stored locally in `server/uploads`
- Analysis uses OpenAI Vision and returns an estimated body fat %, symmetry, strengths, weaknesses
