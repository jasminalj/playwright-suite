import { test, expect } from '../../fixtures';
import { ApiClient }    from '../../utils/apiClient';
import { users }        from '../../data/users';

test.describe('Login API', () => {

  test('@smoke [LGN-API-P-01] valid credentials return 200 with token', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.login(users.valid.email, users.valid.password);
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('token');
    expect(body).not.toHaveProperty('password');
  });

  test('@smoke [LGN-API-N-01] wrong password returns 401', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.login(users.valid.email, 'wrong-password');
    const body = await response.json();
    expect(response.status()).toBe(401);
    expect(body).not.toHaveProperty('token');
  });

  test('[LGN-API-N-02] non-existent email returns 401', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.login(users.nonExistent.email, users.nonExistent.password);
    expect(response.status()).toBe(401);
  });

  test('[LGN-API-N-03] missing email returns 400', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.login('', users.valid.password);
    expect(response.status()).toBe(400);
  });

  test('[LGN-API-N-04] missing password returns 400', async ({ request }) => {
    const client = new ApiClient(request);
    const response = await client.login(users.valid.email, '');
    expect(response.status()).toBe(400);
  });

});
