import { NowResponse, NowRequest } from '@vercel/node'
import { AuthorisedRequest, ID_HEADER, DOMAIN_HEADER } from './dto';
import { LogLevelDesc } from 'loglevel';
import { getLogger, LogLevelNumbers, LoggingMethod } from 'loglevel';
import { createLogger, ILogzioLogger } from 'logzio-nodejs';
import { JsonLog } from 'loglevel-plugin-remote';
import { verify, sign, Secret, SignOptions, SignCallback } from 'jsonwebtoken';
import SetupFetch from '@zeit/fetch';
import { FetchOptions } from '@zeit/fetch';
import { URL } from 'url';
export const fetch = SetupFetch();

export * from './dto';

class RemoteLog {
  private logz: ILogzioLogger;
  private anythingToSend = false;

  constructor(jsonReq: AuthorisedRequest) {
    if (process.env.LOGZ_KEY == null)
      throw new HttpError(500, 'Bad lambda configuration');

    this.logz = createLogger({
      token: process.env.LOGZ_KEY,
      protocol: 'https',
      host: 'listener.logz.io',
      type: 'm-ld',
      extraFields: {
        origin: jsonReq.origin,
        '@id': jsonReq['@id'],
        '@domain': jsonReq['@domain']
      }
    });
  }

  log(json: JsonLog) {
    // https://github.com/logzio/logzio-nodejs/issues/82
    this.logz.log(<any>json);
    this.anythingToSend = true;
  }

  async close(): Promise<void> {
    // Logz does a send round-trip even if there's nothing in the queue
    if (this.anythingToSend)
      return new Promise((resolve, reject) =>
        this.logz.sendAndClose(err => err ? reject(err) : resolve()))
  }
}
/**
 * Global used for shipping to Logz.io within the context of a responder.
 */
let remoteLog: RemoteLog | null = null;
/**
 * Global used for lambda logging, produces JSON format and ships to Logz.io
 * within the context of a responder.
 */
export const LOG = getLogger('lambda');
const localFactory = LOG.methodFactory;
LOG.methodFactory = function (
  methodName: string, level: LogLevelNumbers, loggerName: string): LoggingMethod {
  const localMethod = localFactory(methodName, level, loggerName);
  return function (...message: any[]) {
    // Log locally (to console)
    localMethod.apply(this, message);
    // And remotely (to Logz)
    remoteLog?.log({
      level: <any>Object.keys(LOG.levels)[level],
      logger: loggerName,
      message: `${message}`, // TODO: Interpolate
      stacktrace: '', // TODO if necessary
      timestamp: new Date().toISOString()
    });
  }
}
LOG.setLevel(process.env.LOG as LogLevelDesc || 'warn');

/**
 * Within a responder handler, internal server errors such as from a third-party
 * service can be just strings.
 */
export function responder<Q extends AuthorisedRequest, R>(
  auth: Auth, handler: (q: Q, remoteLog: RemoteLog) => Promise<R>) {
  return async (req: NowRequest, res: NowResponse) => {
    try {
      const authReq = getAuthorisedRequest<Q>(req);
      remoteLog = new RemoteLog(authReq);
      await auth.authorise(authReq.token);
      const jsonRes = await handler(authReq, remoteLog);
      // Vercel aggressively kills the lambda once the response is sent, so
      // ensure that remote logs have been sent before responding
      await remoteLog.close();
      res.json(jsonRes);
    } catch (err) {
      HttpError.respond(res, err);
    } finally {
      remoteLog = null;
    }
  }
}

function getAuthorisedRequest<Q extends AuthorisedRequest>(req: NowRequest): Q {
  const jsonReq: Partial<Q> = req.body;
  const headerToken = req.headers.authorization != null ?
    /Bearer\s(.+)/.exec(req.headers.authorization)?.[1] : null;
  if (headerToken != null)
    jsonReq.token = headerToken;
  ifHeader(req, ID_HEADER, value => jsonReq['@id'] = value);
  ifHeader(req, DOMAIN_HEADER, value => jsonReq['@domain'] = value);
  ifHeader(req, 'origin', value => jsonReq.origin = jsonReq.origin ?? value);
  if (hasAuthorisation(jsonReq))
    return jsonReq;
  else
    throw new HttpError(401, 'Missing authorised request fields');
}

function hasAuthorisation<Q extends AuthorisedRequest>(jsonReq: Partial<Q>): jsonReq is Q {
   // TODO: Validate other Q fields
  return jsonReq['@id'] != null &&
    jsonReq['@domain'] != null &&
    jsonReq.token != null &&
    jsonReq.origin != null;
}

function ifHeader(req: NowRequest, key: string, cb: (value: string) => void) {
  const value = req.headers[key];
  if (value != null && value.length)
    cb(Array.isArray(value) ? value[0] : value);
}

export interface Auth {
  authorise(token: string): Promise<void>;
}

export class JwtAuth implements Auth {
  constructor(
    private readonly secret: string | undefined) {
  }

  async authorise(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.secret == null)
        throw 'Bad lambda configuration';
      verify(token, this.secret, err => err ? reject(err) : resolve());
    });
  }
}

export function signJwt(
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret,
  options?: SignOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cb: SignCallback = (err, token) => err ? reject(err) : resolve(token);
    if (options != null)
      sign(payload, secretOrPrivateKey, options, cb);
    else
      sign(payload, secretOrPrivateKey, cb);
  });
}

export class RecaptchaAuth implements Auth {
  constructor(
    private readonly secret: string | undefined) {
  }

  async authorise(token: string): Promise<void> {
    if (this.secret == null)
      throw 'Bad lambda configuration';

    // Validate the token, see https://developers.google.com/recaptcha/docs/v3
    const siteVerify = await fetchJson<{
      success: boolean, action: string, score: number, 'error-codes': string[]
    }>(
      'https://www.google.com/recaptcha/api/siteverify', {
      secret: this.secret,
      response: token
    }, { method: 'POST' });

    if (typeof siteVerify === 'string')
      throw `reCAPTCHA failed with ${siteVerify}`;

    if (!siteVerify.success)
      throw `reCAPTCHA failed with ${siteVerify['error-codes']}`;

    if (siteVerify.action != 'config')
      throw new HttpError(403, `reCAPTCHA action mismatch, received '${siteVerify.action}'`);

    if (siteVerify.score < 0.5)
      throw new HttpError(403, `reCAPTCHA check failed`);
  }
}

export class HttpError {
  constructor(
    private readonly statusCode: number,
    private readonly statusMessage: string) {
  }

  respond(res: NowResponse): NowResponse {
    if (this.statusCode >= 500) {
      LOG.warn(this);
      return res.status(500).send('Internal server error');
    } else {
      return res.status(this.statusCode).send(this.statusMessage);
    }
  }

  static respond(res: NowResponse, err: any): NowResponse {
    const httpError = err instanceof HttpError ? err : new HttpError(500, `${err}`);
    return httpError.respond(res);
  }
}

export async function fetchJson<T extends object>(
  urlString: string,
  params: object = {},
  options: FetchOptions = { method: 'GET' }): Promise<T> {
  const url = new URL(urlString);
  Object.entries(params).forEach(([name, value]) =>
    url.searchParams.append(name, `${value}`));
  return fetchJsonUrl(url, options);
}

export async function fetchJsonUrl<T extends object>(
  url: URL, options: FetchOptions = { method: 'GET' }): Promise<T> {
  const res = await fetch(url.toString(), options);
  if (res.ok) {
    const json = await res.json();
    if (json == null)
      throw `No JSON returned from ${url}`;
    return json;
  } else {
    throw `Fetch from ${url} failed with ${res.status}: ${res.statusText}`;
  }
}

type PartOfSpeech = 'noun' | 'adjective' | 'proper-noun';

export interface WordParams {
  includePartOfSpeech: PartOfSpeech;
  maxLength?: number;
}

export async function randomWord(params: WordParams | PartOfSpeech): Promise<string> {
  if (process.env.WORDNIK_API_KEY == null)
    throw new HttpError(500, 'Bad lambda configuration');
  if (typeof params == 'string')
    params = { includePartOfSpeech: params };
  const rtn = await fetchJson<{ word: string; }>(
    'http://api.wordnik.com/v4/words.json/randomWord', {
    api_key: process.env.WORDNIK_API_KEY, ...params
  });
  // Only accept alphabet and hyphen characters
  return /^[a-z\-]+$/.test(rtn.word) ? rtn.word : randomWord(params);
}
