import { JwtAuth, signJwt } from './auth';

const [ABLY_KEY_NAME, ABLY_SECRET] = process.env.ABLY_KEY?.split(':') ?? [];

/**
 * Get an Ably token for the client
 */
export async function ablyToken(domain: string, clientId: string): Promise<string> {
  if (ABLY_KEY_NAME == null)
    throw 'Bad lambda configuration';
  return signJwt({
    'x-ably-capability': JSON.stringify({ [`${domain}:*`]: ['subscribe', 'publish', 'presence'] }),
    'x-ably-clientId': clientId
  }, ABLY_SECRET, {
    keyid: ABLY_KEY_NAME,
    expiresIn: '10m'
  });
}

export const ablyJwtAuth = new JwtAuth(ABLY_SECRET);
