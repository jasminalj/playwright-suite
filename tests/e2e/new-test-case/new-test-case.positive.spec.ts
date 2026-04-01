import { test, expect }      from '../../../fixtures';
import { NewTestCasePage }   from '../../../pages/NewTestCasePage';
import { buildTestCase, orderedStepsPayload } from '../../../data/testCaseData';

test.describe('New Test Case — Positive', () => {

  test('@smoke [NTC-UI-P-01] submit with all required fields saves the test case', async ({ authenticatedPage }) => {
    const ntcPage = new NewTestCasePage(authenticatedPage);
    await ntcPage.navigate('/test-cases-new.html');
    const data = buildTestCase();
    await ntcPage.createTestCase({ title: data.title, expectedResult: data.expectedResult, steps: data.steps });
    await expect(authenticatedPage).toHaveURL(/test-cases/);
  });

  test('@smoke [NTC-UI-P-03] multiple test steps are saved in correct order', async ({ authenticatedPage }) => {
    const ntcPage = new NewTestCasePage(authenticatedPage);
    await ntcPage.navigate('/test-cases-new.html');
    const { title, expectedResult, steps } = orderedStepsPayload;
    await ntcPage.fillTitle(title);
    await ntcPage.fillExpectedResult(expectedResult);
    await ntcPage.fillSteps(steps);
    const rendered = await ntcPage.getRenderedStepValues();
    expect(rendered).toEqual(steps);
    await ntcPage.submit();
    await expect(authenticatedPage).toHaveURL(/test-cases/);
  });

  test('[NTC-UI-P-04] Automated toggle defaults to OFF', async ({ authenticatedPage }) => {
    const ntcPage = new NewTestCasePage(authenticatedPage);
    await ntcPage.navigate('/test-cases-new.html');
    expect(await ntcPage.isAutomatedChecked()).toBe(false);
  });

  test('[NTC-UI-P-05] submit without Description succeeds', async ({ authenticatedPage }) => {
    const ntcPage = new NewTestCasePage(authenticatedPage);
    await ntcPage.navigate('/test-cases-new.html');
    const data = buildTestCase();
    await ntcPage.createTestCase({ title: data.title, expectedResult: data.expectedResult, steps: data.steps });
    await expect(authenticatedPage).toHaveURL(/test-cases/);
  });

});
