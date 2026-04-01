import { test, expect }    from '../../../fixtures';
import { users }           from '../../../data/users';
import { captureRequests } from '../../../utils/networkUtils';

test.describe('Login — Negative', () => {

  test('@smoke [LGN-UI-N-01] invalid credentials shows an error message', async ({ loginPage }) => {
    await loginPage.login(users.invalid.email, users.invalid.password);
    expect(await loginPage.isErrorBannerVisible()).toBe(true);
    expect(await loginPage.getErrorBannerText()).toContain('Invalid');
  });

  test('@smoke [LGN-UI-N-02] empty email blocks submission — no backend call', async ({ loginPage, page }) => {
    await loginPage.fillPassword(users.valid.password);
    const requests = await captureRequests(page, /login/, async () => { await loginPage.submit(); });
    expect(requests).toHaveLength(0);
    expect(await loginPage.isEmailErrorVisible()).toBe(true);
  });

  test('@smoke [LGN-UI-N-03] empty password blocks submission — no backend call', async ({ loginPage, page }) => {
    await loginPage.fillEmail(users.valid.email);
    const requests = await captureRequests(page, /login/, async () => { await loginPage.submit(); });
    expect(requests).toHaveLength(0);
    expect(await loginPage.isPasswordErrorVisible()).toBe(true);
  });

  test('@smoke [LGN-UI-N-04] invalid email format shows validation error', async ({ loginPage }) => {
    await loginPage.fillEmail('notanemail');
    await loginPage.fillPassword(users.valid.password);
    await loginPage.submit();
    expect(await loginPage.isEmailErrorVisible()).toBe(true);
  });

  test('[LGN-UI-N-05] both fields empty shows individual errors', async ({ loginPage }) => {
    await loginPage.submit();
    expect(await loginPage.isEmailErrorVisible()).toBe(true);
    expect(await loginPage.isPasswordErrorVisible()).toBe(true);
  });

});
