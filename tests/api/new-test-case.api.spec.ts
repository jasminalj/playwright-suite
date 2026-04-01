import { test, expect } from '../../fixtures';
import { ApiClient }    from '../../utils/apiClient';
import { buildTestCase, orderedStepsPayload } from '../../data/testCaseData';

test.describe('New Test Case API', () => {

  test('@smoke [NTC-API-P-01] all required fields return 201', async ({ request }) => {
    const client = new ApiClient(request);
    const data = buildTestCase();
    const response = await client.createTestCase({ title: data.title, expectedResult: data.expectedResult, steps: data.steps });
    const body = await response.json();
    expect(response.status()).toBe(201);
    expect(body).toHaveProperty('id');
  });

  test('[NTC-API-P-02] multiple steps are persisted in order', async ({ request }) => {
    const client = new ApiClient(request);
    const { title, expectedResult, steps } = orderedStepsPayload;
    const response = await client.createTestCase({ title, expectedResult, steps });
    const body = await response.json();
    expect(response.status()).toBe(201);
    expect(body.steps).toEqual(steps);
  });

  test('@smoke [NTC-API-N-01] missing title returns 400', async ({ request }) => {
    const client = new ApiClient(request);
    const data = buildTestCase();
    const response = await client.createTestCase({ expectedResult: data.expectedResult, steps: data.steps });
    expect(response.status()).toBe(400);
  });

  test('@smoke [NTC-API-N-04] empty steps array returns 400', async ({ request }) => {
    const client = new ApiClient(request);
    const data = buildTestCase({ steps: [] });
    const response = await client.createTestCase(data);
    expect(response.status()).toBe(400);
  });

  test('[NTC-API-N-05] missing steps field returns 400', async ({ request }) => {
    const client = new ApiClient(request);
    const data = buildTestCase();
    const response = await client.createTestCase({ title: data.title, expectedResult: data.expectedResult });
    expect(response.status()).toBe(400);
  });

});
