import { DOMAIN_HEADER, ID_HEADER, Session } from '../dto';
import { RootLogger } from 'loglevel';
import * as remoteLog from 'loglevel-plugin-remote';

export * from '../dto';

let remoteLogApplied = false;

export function configureLogging(session: Session, logger: RootLogger) {
  if (session.logLevel != null)
    logger.setLevel(session.logLevel);
  remoteLog.apply(logger, {
    url: '/api/log',
    token: session.token,
    headers: {
      [ID_HEADER]: session['@id'],
      [DOMAIN_HEADER]: session['@domain']
    },
    format: remoteLog.json
  });
  remoteLogApplied = true;
}

export function setLogToken(token: string) {
  if (remoteLogApplied)
    remoteLog.setToken(token);
}

export function modernizd(asyncFeatures: string[]): Promise<void> {
  if (asyncFeatures.length == 0) {
    const missing = Object.keys(Modernizr).filter(
      (key: keyof ModernizrStatic) => !Modernizr[key]);
    if (missing.length)
      return Promise.reject(missing);
    else
      return Promise.resolve();
  } else {
    return new Promise((resolve, reject) => {
      Modernizr.on(asyncFeatures[0], () =>
        modernizd(asyncFeatures.slice(1)).then(resolve).catch(reject));
    })
  }
}

export class Grecaptcha {
  static ready: Promise<void> = new Promise(resolve => grecaptcha.ready(resolve));

  static async execute(action: string): Promise<string> {
    const site = process.env.RECAPTCHA_SITE;
    if (site == null)
      throw new Error('Bad configuration: reCAPTCHA site missing');
    return grecaptcha.execute(site, { action });
  }

  static render(container: HTMLElement, parameters?: ReCaptchaV2.Parameters): Promise<string> {
    const sitekey = process.env.RECAPTCHA_V2_SITE;
    return new Promise((resolve, reject) => {
      grecaptcha.render(container, {
        sitekey,
        callback: resolve,
        'expired-callback': () => reject(new GrecaptchaExpired()),
        'error-callback': () => reject(new Error('reCAPTCHA failed')),
        ...parameters
      });
    });
  }
}

export class GrecaptchaExpired extends Error {
  constructor() {
    super('reCAPTCHA expired');
  }
}
