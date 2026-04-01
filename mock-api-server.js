const http = require('http');

const VALID_EMAIL    = 'testuser@sandbox.com';
const VALID_PASSWORD = 'ValidPass1!';
const PORT           = 4001;

const server = http.createServer((req, res) => {
  // CORS headers so browser fetch calls work
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    let data = {};
    try { data = JSON.parse(body); } catch { /* ignore */ }

    // POST /api/login
    if (req.method === 'POST' && req.url === '/login') {
      const { email, password, rememberMe } = data;

      if (!email)    return respond(res, 400, { error: 'email is required' });
      if (!password) return respond(res, 400, { error: 'password is required' });

      if (email !== VALID_EMAIL || password !== VALID_PASSWORD)
        return respond(res, 401, { error: 'Invalid email or password' });

      return respond(res, 200, {
        token: 'mock-jwt-token-abc123',
        ttl:   rememberMe ? 604800 : 3600,
        user:  { id: 1, email },
      });
    }

    // POST /api/test-cases
    if (req.method === 'POST' && req.url === '/test-cases') {
      const { title, expectedResult, steps } = data;

      if (!title || String(title).trim() === '')
        return respond(res, 400, { error: 'title is required' });
      if (!expectedResult || String(expectedResult).trim() === '')
        return respond(res, 400, { error: 'expectedResult is required' });
      if (!Array.isArray(steps) || steps.length === 0)
        return respond(res, 400, { error: 'steps must contain at least one step' });

      return respond(res, 201, {
        id:             Math.floor(Math.random() * 90000) + 10000,
        title:          String(title).trim(),
        expectedResult: String(expectedResult).trim(),
        steps,
        automated:      data.automated ?? false,
        description:    data.description ?? null,
        createdAt:      new Date().toISOString(),
      });
    }

    respond(res, 404, { error: 'Not found' });
  });
});

function respond(res, status, body) {
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

server.listen(PORT, () => console.log(`Mock API server running on http://localhost:${PORT}`));
