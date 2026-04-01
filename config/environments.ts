import * as dotenv from 'dotenv';
dotenv.config();

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  baseUrl:       optional('BASE_URL',     'http://localhost:4000'),
  apiBaseUrl:    optional('API_BASE_URL', 'http://localhost:4001'),
  validEmail:    optional('VALID_EMAIL'),
  validPassword: optional('VALID_PASSWORD'),
  adminEmail:    optional('ADMIN_EMAIL'),
  adminPassword: optional('ADMIN_PASSWORD'),
};
