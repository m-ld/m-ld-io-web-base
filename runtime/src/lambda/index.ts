import type { VercelApiHandler, VercelRequest } from '../vercel';
import { AuthorisedRequest, DOMAIN_HEADER, ID_HEADER } from '../dto';
import { HttpError } from '../server/fetch';
import { JsonLogger, withRemoteLogging } from '../server/logging';
import { Auth } from '../server/auth';

export * from '../dto';
export * from '../server/logging';
export * from '../server/fetch';
export * from '../server/auth';

/**
 * Generally timeout in half of the overall lambda timeout, to get early warning of issues
 * @see https://vercel.com/docs/platform/limits
 */
export const SERVICE_TIMEOUT = 10000 / 2;

/**
 * Within a responder handler, internal server errors such as from a third-party
 * service can be just strings.
 */
export function responder<Q extends AuthorisedRequest, R>(
  auth: Auth, handler: (q: Q, remoteLog: JsonLogger) => Promise<R>): VercelApiHandler {
  return async (req, res) => {
    try {
      const authReq = getAuthorisedRequest<Q>(req);
      const jsonRes = await withRemoteLogging(authReq, async (remoteLog) => {
        await auth.authorise(authReq.token);
        return handler(authReq, remoteLog);
      });
      res.json(jsonRes);
    } catch (err) {
      HttpError.respond(res, err);
    }
  }
}

function getAuthorisedRequest<Q extends AuthorisedRequest>(req: VercelRequest): Q {
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

function ifHeader(req: VercelRequest, key: string, cb: (value: string) => void) {
  const value = req.headers[key];
  if (value != null && value.length)
    cb(Array.isArray(value) ? value[0] : value);
}

