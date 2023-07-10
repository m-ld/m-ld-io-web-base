import { getLogger, LoggingMethod, LogLevelDesc, LogLevelNames, LogLevelNumbers } from 'loglevel';
import { createLogger, ILogzioLogger } from 'logzio-nodejs';
import { AuthorisedRequest } from '../dto';
import { HttpError } from './fetch';
import { JsonLog } from 'loglevel-plugin-remote';

export interface JsonLogger {
  log(json: JsonLog): void;
}

export async function withRemoteLogging<R>(
  authReq: AuthorisedRequest, handler: (remoteLog: JsonLogger) => Promise<R>) {
  try {
    remoteLog = new RemoteLog(authReq);
    const res = await handler(remoteLog);
    // Vercel aggressively kills the lambda once the response is sent, so
    // ensure that remote logs have been sent before returning
    await remoteLog.close();
    return res;
  } finally {
    remoteLog = null;
  }
}

class RemoteLog implements JsonLogger {
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
        this.logz.sendAndClose(err => err ? reject(err) : resolve()));
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
  methodName: LogLevelNames,
  level: LogLevelNumbers,
  loggerName: string
): LoggingMethod {
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
