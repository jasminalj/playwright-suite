import { Page, Request } from '@playwright/test';

export async function captureRequests(page: Page, pattern: string | RegExp, action: () => Promise<void>, waitMs = 500): Promise<Request[]> {
  const captured: Request[] = [];
  const listener = (req: Request): void => {
    const url = req.url();
    const matched = typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url);
    if (matched) captured.push(req);
  };
  page.on('request', listener);
  await action();
  await page.waitForTimeout(waitMs);
  page.off('request', listener);
  return captured;
}
