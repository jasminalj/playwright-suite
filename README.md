# Automation Suite — Login & New Test Case

Playwright + TypeScript. Runs fully offline — no credentials, no real backend needed.

## Quick start

```bash
npm install
npm run install:browsers
npm test
npm run test:smoke
npm run test:report
```

## Connect to a real app

Create `.env` from `.env.example` and fill in the values. When `BASE_URL` is set the local server is skipped automatically.
