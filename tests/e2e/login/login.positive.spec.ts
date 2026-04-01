import { test, expect } from '../../../fixtures';
import { users }        from '../../../data/users';

test.describe('Login — Positive', () => {

  test('@smoke [LGN-UI-P-01] successful login redirects to dashboard', async ({ loginPage, page }) => {
    await loginPage.login(users.valid.email, users.valid.password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('@smoke [LGN-UI-P-06] password field is masked', async ({ loginPage }) => {
    await loginPage.fillPassword('any-input');
    expect(await loginPage.getPasswordInputType()).toBe('password');
  });

  test('[LGN-UI-P-03] Remember Me toggle defaults to OFF', async ({ loginPage }) => {
    expect(await loginPage.isRememberMeChecked()).toBe(false);
  });

});
