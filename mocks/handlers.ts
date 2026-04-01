import { Page, Route, Request } from '@playwright/test';

const VALID_EMAIL    = 'testuser@sandbox.com';
const VALID_PASSWORD = 'ValidPass1!';

export async function applyApiMocks(page: Page): Promise<void> {
  await page.route('**/api/login',      handleLogin);
  await page.route('**/api/test-cases', handleTestCases);
}

async function handleLogin(route: Route, request: Request): Promise<void> {
  let body: Record<string, unknown> = {};
  try { body = JSON.parse(request.postData() ?? '{}'); } catch { /* ignore */ }

  const { email, password, rememberMe } = body as {
    email?: string; password?: string; rememberMe?: boolean;
  };

  if (!email) return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'email is required' }) });
  if (!password) return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'password is required' }) });
  if (email !== VALID_EMAIL || password !== VALID_PASSWORD) return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Invalid email or password' }) });

  route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ token: 'mock-jwt-token-abc123', ttl: rememberMe ? 604800 : 3600, user: { id: 1, email } }),
  });
}

async function handleTestCases(route: Route, request: Request): Promise<void> {
  let body: Record<string, unknown> = {};
  try { body = JSON.parse(request.postData() ?? '{}'); } catch { /* ignore */ }

  const { title, expectedResult, steps } = body as { title?: string; expectedResult?: string; steps?: unknown[] };

  if (!title || String(title).trim() === '')           return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'title is required' }) });
  if (!expectedResult || String(expectedResult).trim() === '') return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'expectedResult is required' }) });
  if (!Array.isArray(steps) || steps.length === 0)     return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'steps must contain at least one step' }) });

  route.fulfill({
    status: 201, contentType: 'application/json',
    body: JSON.stringify({ id: Math.floor(Math.random() * 90000) + 10000, title: String(title).trim(), expectedResult: String(expectedResult).trim(), steps, automated: body.automated ?? false, description: body.description ?? null, createdAt: new Date().toISOString() }),
  });
}
