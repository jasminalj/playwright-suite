import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly emailInput:         Locator;
  private readonly passwordInput:      Locator;
  private readonly loginButton:        Locator;
  private readonly rememberMeToggle:   Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly adminLink:          Locator;
  private readonly errorBanner:        Locator;
  private readonly emailError:         Locator;
  private readonly passwordError:      Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput         = page.getByLabel('Email');
    this.passwordInput      = page.getByLabel('Password');
    this.loginButton        = page.getByRole('button', { name: /^login$/i });
    this.rememberMeToggle   = page.getByRole('checkbox', { name: /remember me/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.adminLink          = page.getByRole('link', { name: /^admin$/i });
    this.errorBanner        = page.getByRole('alert');
    this.emailError         = page.locator('[data-testid="email-error"]');
    this.passwordError      = page.locator('[data-testid="password-error"]');
  }

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

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async clickAdminLink(): Promise<void> {
    await this.adminLink.click();
  }

  async getErrorBannerText(): Promise<string | null> {
    return this.errorBanner.textContent();
  }

  async isErrorBannerVisible(): Promise<boolean> {
    return this.errorBanner.isVisible();
  }

  async isEmailErrorVisible(): Promise<boolean> {
    return this.emailError.isVisible();
  }

  async isPasswordErrorVisible(): Promise<boolean> {
    return this.passwordError.isVisible();
  }

  async isRememberMeChecked(): Promise<boolean> {
    return this.rememberMeToggle.isChecked();
  }

  async getPasswordInputType(): Promise<string | null> {
    return this.passwordInput.getAttribute('type');
  }
}
