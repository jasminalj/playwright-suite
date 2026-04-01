import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class NewTestCasePage extends BasePage {
  private readonly titleInput:          Locator;
  private readonly descriptionInput:    Locator;
  private readonly expectedResultInput: Locator;
  private readonly addStepButton:       Locator;
  private readonly automatedToggle:     Locator;
  private readonly submitButton:        Locator;
  private readonly backButton:          Locator;
  private readonly titleError:          Locator;
  private readonly expectedResultError: Locator;
  private readonly stepsError:          Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput          = page.getByLabel('Title');
    this.descriptionInput    = page.getByLabel('Description');
    this.expectedResultInput = page.getByLabel('Expected Result');
    this.addStepButton       = page.getByRole('button', { name: /add test step/i });
    this.submitButton        = page.getByRole('button', { name: /submit/i });
    this.automatedToggle     = page.getByRole('checkbox', { name: /automated/i });
    this.backButton          = page.getByRole('button', { name: /back/i }).or(page.getByRole('link', { name: /back/i }));
    this.titleError          = page.locator('[data-testid="title-error"]');
    this.expectedResultError = page.locator('[data-testid="expected-result-error"]');
    this.stepsError          = page.locator('[data-testid="steps-error"]');
  }

  async fillTitle(value: string): Promise<void> {
    await this.titleInput.fill(value);
  }

  async fillDescription(value: string): Promise<void> {
    await this.descriptionInput.fill(value);
  }

  async fillExpectedResult(value: string): Promise<void> {
    await this.expectedResultInput.fill(value);
  }

  async fillStep(index: number, value: string): Promise<void> {
    await this.page.getByPlaceholder('Test step').nth(index).fill(value);
  }

  async addStep(): Promise<void> {
    await this.addStepButton.click();
  }

  async fillSteps(steps: string[]): Promise<void> {
    await this.fillStep(0, steps[0]);
    for (let i = 1; i < steps.length; i++) {
      await this.addStep();
      await this.fillStep(i, steps[i]);
    }
  }

  async toggleAutomated(): Promise<void> {
    await this.automatedToggle.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async clickBack(): Promise<void> {
    await this.backButton.click();
  }

  async createTestCase(opts: {
    title: string;
    expectedResult: string;
    steps: string[];
    description?: string;
    automated?: boolean;
  }): Promise<void> {
    await this.fillTitle(opts.title);
    if (opts.description) await this.fillDescription(opts.description);
    await this.fillExpectedResult(opts.expectedResult);
    await this.fillSteps(opts.steps);
    if (opts.automated) await this.toggleAutomated();
    await this.submit();
  }

  async isAutomatedChecked(): Promise<boolean> {
    return this.automatedToggle.isChecked();
  }

  async isTitleErrorVisible(): Promise<boolean> {
    return this.titleError.isVisible();
  }

  async isExpectedResultErrorVisible(): Promise<boolean> {
    return this.expectedResultError.isVisible();
  }

  async isStepsErrorVisible(): Promise<boolean> {
    return this.stepsError.isVisible();
  }

  async getRenderedStepValues(): Promise<string[]> {
    const stepInputs = this.page.getByPlaceholder('Test step');
    const count = await stepInputs.count();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      values.push((await stepInputs.nth(i).inputValue()).trim());
    }
    return values;
  }
}
