import { JwtPayload, verify } from 'jsonwebtoken';
import { HttpError } from './fetch';

/** String from environment variable */
export type EnvVar = string | undefined;

export interface Auth {
  authorise(token: string): Promise<unknown>;
}

export { signJwt } from './jwt';

export class JwtAuth implements Auth {
  constructor(
    private readonly secret: EnvVar) {
  }

  async authorise(token: string): Promise<JwtPayload | string> {
    return new Promise((resolve, reject) => {
      if (this.secret == null)
        throw 'Bad lambda configuration';
      verify(token, this.secret, (err, payload) => err ?
        reject(new HttpError(401, `${err}`)) :
        resolve(payload!));
    });
  }
}

export class PrefixAuth implements Auth {
  constructor(
    private readonly auths: { [prefix: string]: Auth }) {
  }

  authorise(token: string) {
    const prefix = token.split(':', 1)[0];
    token = token.slice(prefix.length + 1);
    if (prefix in this.auths)
      return this.auths[prefix].authorise(token);
    else
      throw `Invalid prefix ${prefix}`;
  }
}
