# Automation Framework Rules

**Project:** Login & New Test Case — Smoke / E2E Suite  
**Language:** TypeScript  
**Tool:** Playwright  
**Pattern:** Page Object Model (POM)  
**Version:** 1.0

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Architecture — Page Object Model](#2-architecture--page-object-model)
3. [Locator Hierarchy](#3-locator-hierarchy)
4. [Test Data Rules](#4-test-data-rules)
5. [Coding Standards](#5-coding-standards)
6. [Playwright-Specific Rules](#6-playwright-specific-rules)
7. [Assertions](#7-assertions)
8. [Timeouts & Retries](#8-timeouts--retries)
9. [Error Handling](#9-error-handling)
10. [Reporting](#10-reporting)
11. [CI Integration](#11-ci-integration)

---

## 1. Project Structure

```
/
├── tests/
│   ├── e2e/
│   │   ├── login/
│   │   │   ├── login.positive.spec.ts
│   │   │   └── login.negative.spec.ts
│   │   └── new-test-case/
│   │       ├── new-test-case.positive.spec.ts
│   │       └── new-test-case.negative.spec.ts
│   └── api/
│       ├── login.api.spec.ts
│       └── new-test-case.api.spec.ts
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   └── NewTestCasePage.ts
├── fixtures/
│   ├── index.ts               # Exports all custom fixtures
│   ├── auth.fixture.ts        # Authenticated browser context
│   └── testcase.fixture.ts    # Test case form data factory
├── data/
│   ├── users.ts               # User credential sets
│   └── testCaseData.ts        # Test case payload factories
├── utils/
│   ├── networkUtils.ts        # Request interception helpers
│   └── apiClient.ts           # Lightweight API wrapper
├── config/
│   └── environments.ts        # Base URLs, env-specific config
├── reports/                   # Generated reports (git-ignored)
├── playwright.config.ts
├── tsconfig.json
├── .env.example               # Documents required env vars, no secrets
└── rules.md                   # This file
```

**Rules:**
- Each feature gets its own subdirectory under `tests/e2e/` and `tests/api/`.
- Positive and negative scenarios live in separate spec files per feature.
- No test logic lives in page objects. No page logic lives in spec files.
- `reports/` is always git-ignored. Never commit generated output.

---

## 2. Architecture — Page Object Model

### Principles

- Every page or significant UI component that is tested gets its own Page Object class.
- Page Objects encapsulate **locators** and **actions** only. They do not contain assertions.
- Assertions belong exclusively in spec files.
- Page Objects are composable — complex pages may import and delegate to component objects.

### BasePage

All Page Objects extend `BasePage`. It holds the `page` instance and shared utilities.

```typescript
// pages/BasePage.ts
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
```

### Page Object Structure

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // --- Locators (private, exposed via getters if needed) ---
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly rememberMeToggle: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly errorMessage: Locator;
  private readonly emailError: Locator;
  private readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);
    // Locators defined once in constructor — see Section 3 for hierarchy rules
    this.emailInput      = page.getByLabel('Email');
    this.passwordInput   = page.getByLabel('Password');
    this.loginButton     = page.getByRole('button', { name: 'Login' });
    this.rememberMeToggle = page.getByRole('checkbox', { name: /remember me/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.errorMessage    = page.getByRole('alert');
    this.emailError      = page.getByText(/valid email/i);
    this.passwordError   = page.getByText(/password is required/i);
  }

  // --- Actions ---
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async toggleRememberMe(): Promise<void> {
    await this.rememberMeToggle.click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  // --- State accessors (return values for assertions in spec) ---
  async getErrorMessage(): Promise<string | null> {
    return this.errorMessage.textContent();
  }

  async isRememberMeChecked(): Promise<boolean> {
    return this.rememberMeToggle.isChecked();
  }

  async getPasswordInputType(): Promise<string | null> {
    return this.passwordInput.getAttribute('type');
  }

  async isEmailErrorVisible(): Promise<boolean> {
    return this.emailError.isVisible();
  }

  async isPasswordErrorVisible(): Promise<boolean> {
    return this.passwordError.isVisible();
  }
}
```

**Rules:**
- One class per page. File name matches class name in PascalCase: `LoginPage.ts` → `LoginPage`.
- Locators are defined **once** in the constructor. Never inline a locator inside an action method.
- Action methods are `async`, return `Promise<void>` unless they return a value for assertion.
- State accessor methods (return values) are prefixed with `get`, `is`, or `has`.
- No `expect()` calls inside Page Objects. Ever.

---

## 3. Locator Hierarchy

Use locators in this order of preference. Move down the hierarchy only when the level above is not available.

| Priority | Strategy | Playwright Method | When to Use |
|---|---|---|---|
| 1 | ARIA role + name | `getByRole('button', { name: '...' })` | Interactive elements — buttons, links, checkboxes, inputs |
| 2 | Label text | `getByLabel('Email')` | Form fields with associated `<label>` |
| 3 | Accessible name / aria-label | `getByLabel(...)` or `getByRole(...)` with `name` | Fields with aria-label but no visible label |
| 4 | Placeholder text | `getByPlaceholder('Email')` | Inputs where label is unavailable but placeholder is stable |
| 5 | Visible text | `getByText('...')` | Read-only content, error messages, headings |
| 6 | Test ID attribute | `getByTestId('login-submit')` | When semantic locators are impossible; requires dev to add `data-testid` |
| 7 | CSS selector | `page.locator('.error-message')` | Last resort — only for structural elements with no semantic identity |
| 8 | XPath | `page.locator('//div[...]')` | Absolute last resort — document the reason in a comment |

**Rules:**
- Any use of CSS or XPath **must** have a comment explaining why semantic locators were insufficient.
- Never use index-based locators (`.nth(0)`) without a comment explaining the intent.
- Never use locators that embed dynamic IDs, generated class names, or implementation-specific attributes.
- `data-testid` attributes are the preferred fallback when semantic locators are not feasible — raise a ticket with the dev team to add them.

```typescript
// GOOD
page.getByRole('button', { name: 'Login' })
page.getByLabel('Email')

// ACCEPTABLE with comment
// No label associated with this input; placeholder is stable per design spec
page.getByPlaceholder('Email')

// LAST RESORT — document why
// This error container has no role or accessible name; CSS fallback pending data-testid from dev team (JIRA-123)
page.locator('.error-container > span')
```

---

## 4. Test Data Rules

### Principles

- **No hardcoded credentials in spec files.** All credentials come from environment variables or data factories.
- **No production data.** All test data is synthetic.
- **Stable where repeatability matters.** Random data is seeded or uses deterministic factories.
- **Self-contained.** Each test creates and, where possible, cleans up its own data.

### Environment Variables

Store secrets in `.env` (git-ignored). Document the required keys in `.env.example`.

```bash
# .env.example
BASE_URL=https://sandbox.example.com
VALID_EMAIL=
VALID_PASSWORD=
ADMIN_EMAIL=
ADMIN_PASSWORD=
API_BASE_URL=https://api.sandbox.example.com
```

Access via `process.env` wrapped in a typed config object:

```typescript
// config/environments.ts
export const env = {
  baseUrl:       process.env.BASE_URL       ?? 'http://localhost:3000',
  apiBaseUrl:    process.env.API_BASE_URL   ?? 'http://localhost:3000/api',
  validEmail:    process.env.VALID_EMAIL    ?? '',
  validPassword: process.env.VALID_PASSWORD ?? '',
};
```

### Data Factories

Use factory functions — not raw objects — to generate test data. This keeps data construction in one place.

```typescript
// data/testCaseData.ts
import { faker } from '@faker-js/faker';

export interface TestCasePayload {
  title: string;
  description?: string;
  expectedResult: string;
  steps: string[];
  automated?: boolean;
}

export function buildTestCase(overrides: Partial<TestCasePayload> = {}): TestCasePayload {
  return {
    title:          faker.lorem.sentence(4),
    expectedResult: faker.lorem.sentence(6),
    steps:          [faker.lorem.sentence(5)],
    automated:      false,
    ...overrides,
  };
}

// Usage in spec:
// const data = buildTestCase({ automated: true });
// const multiStep = buildTestCase({ steps: ['Step A', 'Step B', 'Step C'] });
```

**Rules:**
- `faker` is used for randomised content. Pin `@faker-js/faker` to a fixed version.
- When a test depends on a specific value (e.g. verifying order of steps), pass explicit values via overrides — do not rely on faker output for assertions.
- User credential factories return typed objects and read from `env`:

```typescript
// data/users.ts
import { env } from '../config/environments';

export const users = {
  valid:   { email: env.validEmail,   password: env.validPassword },
  invalid: { email: 'nobody@test.com', password: 'WrongPass99!' },
  admin:   { email: env.adminEmail,   password: env.adminPassword },
};
```

---

## 5. Coding Standards

### Naming

| Item | Convention | Example |
|---|---|---|
| Spec files | `<feature>.<polarity>.spec.ts` | `login.negative.spec.ts` |
| Page Object files | `PascalCase.ts` | `LoginPage.ts` |
| Class names | PascalCase | `LoginPage`, `NewTestCasePage` |
| Method names | camelCase, verb-first | `fillEmail()`, `getErrorMessage()` |
| Test descriptions (`test()`) | Sentence case, describe the behaviour | `'shows an error when credentials are invalid'` |
| `describe()` blocks | Feature or page name | `'Login — Negative'` |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_TIMEOUT` |
| Fixtures | camelCase | `authenticatedPage`, `testCaseForm` |

### File Layout Within a Spec File

```typescript
import { test, expect } from '../fixtures';      // 1. Imports
import { LoginPage }    from '../../pages/LoginPage';
import { users }        from '../../data/users';

test.describe('Login — Negative', () => {        // 2. Describe block

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {           // 3. Setup
    loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
  });

  test('shows an error when credentials are invalid', async ({ page }) => {
    // Arrange
    const { email } = users.valid;

    // Act
    await loginPage.login(email, 'WrongPassword1!');

    // Assert
    expect(await loginPage.getErrorMessage()).toContain('Invalid');
  });
});
```

**Rules:**
- Each `test()` follows **Arrange / Act / Assert** — use comments to separate sections if the test body exceeds 10 lines.
- One behaviour per test. Do not chain multiple unrelated assertions in a single test.
- `describe()` blocks are mandatory. Label them as `'<Feature> — <Positive|Negative>'`.
- `beforeEach` handles navigation and page object instantiation. `afterEach` handles cleanup only.
- No `page.waitForTimeout()` anywhere in the codebase. Replace with explicit locator waits or `waitForResponse`.

---

## 6. Playwright-Specific Rules

### Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';
import { env } from './config/environments';

export default defineConfig({
  testDir:    './tests',
  fullyParallel: true,
  retries:    process.env.CI ? 2 : 0,
  workers:    process.env.CI ? 4 : 2,
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['list'],
  ],
  use: {
    baseURL:           env.baseUrl,
    trace:             'on-first-retry',
    screenshot:        'only-on-failure',
    video:             'on-first-retry',
    actionTimeout:     10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Custom Fixtures (`fixtures/index.ts`)

Extend Playwright's base `test` with project-specific fixtures. All spec files import `test` and `expect` from `fixtures/index.ts` — **never** directly from `@playwright/test`.

```typescript
// fixtures/index.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type Fixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;  // Pre-logged-in page context
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
    await use(loginPage);
  },
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
    await loginPage.login(users.valid.email, users.valid.password);
    await page.waitForURL('**/dashboard');
    await use(page);
  },
});

export { expect };
```

### Network Interception (for "no backend call" tests)

```typescript
// utils/networkUtils.ts
import { Page } from '@playwright/test';

export async function captureRequests(page: Page, urlPattern: string | RegExp): Promise<Request[]> {
  const captured: Request[] = [];
  page.on('request', req => {
    if (typeof urlPattern === 'string'
          ? req.url().includes(urlPattern)
          : urlPattern.test(req.url())) {
      captured.push(req);
    }
  });
  return captured;
}
```

Usage in spec:
```typescript
const requests = await captureRequests(page, '/api/login');
await loginPage.submit();
// Small wait to allow any async calls to fire
await page.waitForTimeout(300); // Only acceptable use of waitForTimeout: post-action sniff window
expect(requests).toHaveLength(0);
```

### API Client (`utils/apiClient.ts`)

For API test cases, use Playwright's built-in `request` context — do not add axios or node-fetch.

```typescript
// utils/apiClient.ts
import { APIRequestContext } from '@playwright/test';
import { env } from '../config/environments';

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async login(email: string, password: string, rememberMe = false) {
    return this.request.post(`${env.apiBaseUrl}/login`, {
      data: { email, password, rememberMe },
    });
  }

  async createTestCase(payload: Record<string, unknown>) {
    return this.request.post(`${env.apiBaseUrl}/test-cases`, {
      data: payload,
    });
  }
}
```

---

## 7. Assertions

**Rules:**
- Always use Playwright's `expect()` from `fixtures/index.ts`.
- Prefer **auto-waiting assertions** (`expect(locator).toBeVisible()`) over value-based assertions where possible — they retry automatically.
- Use `toContain` for error messages rather than `toBe` — messages may change wording without breaking intent.
- For API responses, always assert **both** status code and a key field in the response body.

```typescript
// UI assertions — prefer auto-waiting
await expect(page).toHaveURL(/dashboard/);
await expect(errorBanner).toBeVisible();
await expect(rememberMeToggle).not.toBeChecked();
await expect(passwordInput).toHaveAttribute('type', 'password');

// Content assertions
await expect(errorBanner).toContainText('Invalid');

// API assertions — always assert status + body
expect(response.status()).toBe(200);
const body = await response.json();
expect(body).toHaveProperty('token');
expect(body).not.toHaveProperty('password');

// Negative API assertions
expect(response.status()).toBe(400);
const error = await response.json();
expect(error.message).toMatch(/title.*required/i);
```

**Forbidden assertion patterns:**
```typescript
// FORBIDDEN — brittle, breaks on copy changes
expect(errorText).toBe('Invalid email or password.');

// FORBIDDEN — hides intent
expect(something).toBeTruthy();

// FORBIDDEN — skips assertion entirely
expect(true).toBe(true);
```

---

## 8. Timeouts & Retries

| Setting | Value | Scope |
|---|---|---|
| `actionTimeout` | 10 000 ms | Per locator action |
| `navigationTimeout` | 30 000 ms | `goto`, `waitForURL` |
| `expect` timeout (default) | 5 000 ms | Auto-waiting assertions |
| Test-level timeout | 60 000 ms | Entire test |
| Retries (CI) | 2 | On failure |
| Retries (local) | 0 | No retry locally |

**Rules:**
- Override timeouts at test level only for genuinely slow operations (e.g. session expiry test). Document the reason.
- Never increase a timeout to fix a flaky test — find and fix the root cause instead.
- `page.waitForTimeout()` is **banned** except in the network capture sniff window (see Section 6). Use explicit waits:
  - `waitForResponse(urlPattern)`
  - `waitForURL(pattern)`
  - `locator.waitFor({ state: 'visible' })`

---

## 9. Error Handling

**Rules:**
- Tests must be **independent and isolated**. A failure in one test must not affect the next.
- Use `test.beforeEach` for setup and `test.afterEach` for cleanup. Never rely on test order.
- On failure, Playwright captures screenshot, trace, and video automatically (per config). Do not add manual screenshot calls.
- If a test creates data (e.g. a new test case via API), clean it up in `afterEach` using the API — not via UI.

```typescript
test.afterEach(async ({ request }) => {
  if (createdTestCaseId) {
    const client = new ApiClient(request);
    await client.deleteTestCase(createdTestCaseId);
    createdTestCaseId = null;
  }
});
```

- Do not swallow errors with empty `catch` blocks. If an operation is expected to fail, use `toThrow` or assert the response status.
- If the test environment is unavailable, fail fast with a clear message using `test.skip()` and a reason:

```typescript
test.beforeAll(async () => {
  if (!env.baseUrl) {
    test.skip(true, 'BASE_URL environment variable is not set.');
  }
});
```

---

## 10. Reporting

### Output Formats

| Format | Location | Purpose |
|---|---|---|
| HTML | `reports/html/index.html` | Local review — open after run |
| JUnit XML | `reports/junit/results.xml` | CI pipeline integration |
| List (stdout) | Terminal | Real-time feedback during local runs |

### Artifacts on Failure

| Artifact | Location | Trigger |
|---|---|---|
| Screenshot | `test-results/<test-name>/` | On failure |
| Video | `test-results/<test-name>/` | On first retry |
| Trace | `test-results/<test-name>/` | On first retry |

### Viewing Reports

```bash
# Open HTML report after run
npx playwright show-report reports/html

# Open trace viewer for a specific test
npx playwright show-trace test-results/<test-name>/trace.zip
```

### Publishing (CI)

- JUnit XML is consumed by the CI pipeline (GitHub Actions / Jenkins) to display test results inline.
- HTML report is uploaded as a CI artifact and retained for 14 days.
- Trace files are uploaded as CI artifacts only when tests fail.

**Rules:**
- `reports/` and `test-results/` are git-ignored.
- Report generation must not require manual steps — it runs automatically as part of `npx playwright test`.
- Every failed test in the HTML report must have a screenshot attached. Confirm `screenshot: 'only-on-failure'` is set in config.

---

## 11. CI Integration

### npm Scripts (`package.json`)

```json
{
  "scripts": {
    "test":          "npx playwright test",
    "test:smoke":    "npx playwright test --grep @smoke",
    "test:e2e":      "npx playwright test tests/e2e",
    "test:api":      "npx playwright test tests/api",
    "test:ui":       "npx playwright test --project=chromium",
    "test:report":   "npx playwright show-report reports/html"
  }
}
```

### Smoke Tag

Tag smoke/priority tests with `@smoke` in the test title so they can be run in isolation:

```typescript
test('@smoke successful login redirects to dashboard', async ({ loginPage }) => { ... });
```

### Required Environment Variables for CI

All secrets are injected via CI secrets manager (never committed):

```
BASE_URL
API_BASE_URL
VALID_EMAIL
VALID_PASSWORD
ADMIN_EMAIL
ADMIN_PASSWORD
```

---

## Appendix — Quick Reference

```
Forbidden                          Required alternative
─────────────────────────────────────────────────────────
page.waitForTimeout(n)             locator.waitFor() / waitForResponse()
expect(x).toBe('exact string')     expect(x).toContain('key phrase')
expect(x).toBeTruthy()             explicit assertion with clear intent
Inline locator in action method    Locator defined in constructor
expect() inside Page Object        expect() only in spec files
Hardcoded credentials in spec      data/users.ts + .env
CSS/XPath without comment          Semantic locator or add data-testid
```
