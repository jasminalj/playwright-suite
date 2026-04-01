import { test, expect }    from '../../../fixtures';
import { NewTestCasePage } from '../../../pages/NewTestCasePage';
import { buildTestCase }   from '../../../data/testCaseData';

test.describe('New Test Case — Negative', () => {

  test('@smoke [NTC-UI-N-01] submit without Title shows inline error', async ({ authenticatedPage }) => {
    const ntcPage = new NewTestCasePage(authenticatedPage);
    await ntcPage.navigate('/test-cases-new.html');
    const data = buildTestCase();
    await ntcPage.fillExpectedResult(data.expectedResult);
    await ntcPage.fillSteps(data.steps);
    await ntcPage.submit();
    expect(await ntcPage.isTitleErrorVisible()).toBe(true);
  });

  test('@smoke [NTC-UI-N-02] submit without Expected Result shows inline error', async ({ authenticatedPage }) => {
    const ntcPage = new NewTestCasePage(authenticatedPage);
    await ntcPage.navigate('/test-cases-new.html');
    const data = buildTestCase();
    await ntcPage.fillTitle(data.title);
    await ntcPage.fillSteps(data.steps);
    await ntcPage.submit();
    expect(await ntcPage.isExpectedResultErrorVisible()).toBe(true);
  });

  test('@smoke [NTC-UI-N-03] submit without Test Steps shows inline error', async ({ authenticatedPage }) => {
    const ntcPage = new NewTestCasePage(authenticatedPage);
    await ntcPage.navigate('/test-cases-new.html');
    const data = buildTestCase();
    await ntcPage.fillTitle(data.title);
    await ntcPage.fillExpectedResult(data.expectedResult);
    await ntcPage.submit();
    expect(await ntcPage.isStepsErrorVisible()).toBe(true);
  });

  test('[NTC-UI-N-04] Enter key does not submit invalid form', async ({ authenticatedPage }) => {
    const ntcPage = new NewTestCasePage(authenticatedPage);
    await ntcPage.navigate('/test-cases-new.html');
    const data = buildTestCase();
    await ntcPage.fillTitle(data.title);
    await authenticatedPage.getByLabel('Title').press('Enter');
    expect(await ntcPage.isExpectedResultErrorVisible()).toBe(true);
    expect(await ntcPage.isStepsErrorVisible()).toBe(true);
  });

});
