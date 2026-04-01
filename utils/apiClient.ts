import { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/environments';
import { TestCasePayload } from '../data/testCaseData';

export class ApiClient {
  private readonly base: string;
  constructor(private readonly request: APIRequestContext) {
    this.base = env.apiBaseUrl;
  }

  async login(email: string, password: string, rememberMe = false): Promise<APIResponse> {
    return this.request.post(`${this.base}/login`, { data: { email, password, rememberMe } });
  }

  async createTestCase(payload: Partial<TestCasePayload>): Promise<APIResponse> {
    return this.request.post(`${this.base}/test-cases`, { data: payload });
  }
}
