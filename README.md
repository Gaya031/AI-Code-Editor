# Proj Sart

Production-oriented first slice for an AI-powered code editor.

## Running Locally

```bash
npm install
npm run db:init
npm run db:migrate
npm run dev
```

The frontend runs at `http://localhost:5173`.

The backend runs at `http://localhost:4000`.

Health check:

```bash
curl http://localhost:4000/api/health
```

## Structure

```txt
backend/
  prisma/
  scripts/
  src/
    config/
    controllers/
    middlewares/
    routes/
    services/
    utils/

frontend/
  src/
    app/
    controllers/
    model/
    views/
    styles/
```

