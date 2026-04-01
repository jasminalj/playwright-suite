import { env } from '../config/environments';

export const users = {
  valid: {
    email:    env.validEmail    || 'testuser@sandbox.com',
    password: env.validPassword || 'ValidPass1!',
  },
  invalid: {
    email:    'valid@sandbox.com',
    password: 'WrongPassword99!',
  },
  nonExistent: {
    email:    'nobody@sandbox.com',
    password: 'AnyPass1!',
  },
  admin: {
    email:    env.adminEmail    || 'admin@sandbox.com',
    password: env.adminPassword || 'AdminPass1!',
  },
};
