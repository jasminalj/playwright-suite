import { test as base, expect, Page } from '@playwright/test';
import { LoginPage }       from '../pages/LoginPage';
import { NewTestCasePage } from '../pages/NewTestCasePage';
import { applyApiMocks }   from '../mocks/handlers';
import { users }           from '../data/users';

type Fixtures = {
  loginPage:         LoginPage;
  newTestCasePage:   NewTestCasePage;
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({

  loginPage: async ({ page }, use) => {
    await applyApiMocks(page);
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login.html');
    await use(loginPage);
  },

  newTestCasePage: async ({ page }, use) => {
    await applyApiMocks(page);
    const ntcPage = new NewTestCasePage(page);
    await ntcPage.navigate('/test-cases-new.html');
    await use(ntcPage);
  },

  authenticatedPage: async ({ page }, use) => {
    await applyApiMocks(page);
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login.html');
    await loginPage.login(users.valid.email, users.valid.password);
    await page.waitForURL(/dashboard/);
    await use(page);
  },
});

export { expect };
