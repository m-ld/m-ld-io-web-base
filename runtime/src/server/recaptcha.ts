import { Auth, EnvVar } from './auth';
import { fetchJson, HttpError } from './fetch';

export abstract class RecaptchaAuth implements Auth {
  constructor(
    private readonly secret: EnvVar) {
  }

  /**
   * @param token the reCAPTCHA response from the client.
   */
  protected async verify<T extends object = {}>(token: string): Promise<T> {
    if (this.secret == null)
      throw 'Bad lambda configuration';

    const siteVerify = await fetchJson<{
      success: boolean,
      'error-codes': string[]
    } & T>('https://www.google.com/recaptcha/api/siteverify', {
      secret: this.secret,
      response: token
    }, { method: 'POST' });

    if (typeof siteVerify === 'string')
      throw `reCAPTCHA verification failed with ${siteVerify}`;

    if (!siteVerify.success)
      throw `reCAPTCHA verification failed with ${siteVerify['error-codes']}`;

    return siteVerify;
  }

  abstract authorise(token: string): Promise<void>;
}

export class RecaptchaV3Auth extends RecaptchaAuth {
  constructor(secret: EnvVar,
    private readonly threshold = 0.5) {
    super(secret);
  }

  async authorise(token: string): Promise<void> {
    // Validate the token, see https://developers.google.com/recaptcha/docs/v3
    const siteVerify = await this.verify<{
      action: string,
      score: number
    }>(token);

    // v3 has a score and must have the correct action
    if (siteVerify.action !== 'config')
      throw new HttpError(403,
        `reCAPTCHA action mismatch, received '${siteVerify.action}'`);

    if (siteVerify.score < this.threshold)
      throw new HttpError(401,
        `reCAPTCHA check failed, ${siteVerify.score} < ${this.threshold}`);
  }
}

export class RecaptchaV2Auth extends RecaptchaAuth {
  constructor(secret: EnvVar) {
    super(secret);
  }

  async authorise(token: string): Promise<void> {
    // Validate the token, see https://developers.google.com/recaptcha/docs/verify
    await this.verify(token);
  }
}

export const recaptchaV2Auth = new RecaptchaV2Auth(process.env.RECAPTCHA_V2_SECRET);
export const recaptchaV3Auth = new RecaptchaV3Auth(process.env.RECAPTCHA_SECRET);