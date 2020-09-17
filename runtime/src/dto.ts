import { LogLevelDesc } from 'loglevel';
import { JsonLog } from 'loglevel-plugin-remote';

export const ID_HEADER = 'm-ld-id';
export const DOMAIN_HEADER = 'm-ld-domain';

export interface Session {
  /**
   * Session instance identity
   */
  '@id': string;
  /**
   * m-ld domain identity, if applicable
   */
  '@domain': string;
  /**
   * Token for the session
   */
  token: string;
  /**
   * Log level for the session
   */
  logLevel: LogLevelDesc;
}

export interface AuthorisedRequest
  extends Pick<Session, '@id' | '@domain' | 'token'> {
  /**
   * window.location.origin
   */
  origin: string;
}

export namespace Log {
  export interface Request
    extends AuthorisedRequest {
    logs: JsonLog[];
  }

  export type Response = void;
}