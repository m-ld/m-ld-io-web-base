import * as jsonwebtoken from 'jsonwebtoken';
import {
  JwtHeader, JwtPayload, Secret, sign, SignCallback, SignOptions, VerifyOptions
} from 'jsonwebtoken';

/**
 * Promisified version of jsonwebtoken.verify
 */
export function verifyJwt(
  token: string,
  getSecret: (header: JwtHeader) => Promise<string | Secret>,
  options?: VerifyOptions
): Promise<JwtPayload> {
  return new Promise((resolve, reject) =>
    jsonwebtoken.verify(token, (header, cb) => {
      getSecret(header).then(secret => cb(null, secret), err => cb(err));
    }, options, (err, payload: JwtPayload) => {
      if (err) reject(err);
      else resolve(payload);
    }));
}

export function signJwt(
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret,
  options?: SignOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cb: SignCallback = (err, token) => err || !token ?
      reject(err || 'no signature') : resolve(token);
    if (options != null)
      sign(payload, secretOrPrivateKey, options, cb);
    else
      sign(payload, secretOrPrivateKey, cb);
  });
}
