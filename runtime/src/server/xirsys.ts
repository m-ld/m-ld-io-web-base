/** @see https://docs.xirsys.com/?pg=api-turn */
import { fetchJsonUrl } from './fetch';

export interface XirsysConfig {
  ident?: string,
  secret?: string,
  channel?: string,
  timeout?: number
}

export async function loadWrtcConfig(config: number | XirsysConfig = {}) {
  if (typeof config == 'number')
    config = { timeout: config };
  config.ident ??= process.env.XIRSYS_IDENT;
  config.secret ??= process.env.XIRSYS_SECRET;
  config.channel ??= process.env.XIRSYS_CHANNEL;

  const auth = `${config.ident}:${config.secret}`;
  const body = JSON.stringify({ format: 'urls' });
  const res = await fetchJsonUrl<{ v: string, s: 'error' } | { v: RTCConfiguration, s: 'ok' }>(
    new URL(`https://global.xirsys.net/_turn/${config.channel}`), {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(auth).toString('base64')}`,
        'Content-Type': 'application/json',
        'Content-Length': `${body.length}`
      },
      body,
      timeout: config.timeout
    });
  if (res.s !== 'ok')
    throw res.v;
  return { ...res.v, iceServers: fixIceServers(res.v.iceServers) };
}

/** BUG in Xirsys outputs single server without array wrapper */
function fixIceServers(iceServers?: RTCIceServer[] | RTCIceServer): RTCIceServer[] | undefined {
  if (iceServers != null) {
    if (!Array.isArray(iceServers))
      iceServers = [iceServers];
    iceServers.forEach(iceServer => {
      if (Array.isArray(iceServer.urls)) {
        const parsed = iceServer.urls.map(parseIceServerUrl);
        iceServer.urls = [
          removeFirst(parsed, ice => ice.protocol === 'stun'),
          removeFirst(parsed, ice => ice.protocol === 'turn' && ice.transport === 'udp'),
          removeFirst(parsed, ice => ice.protocol === 'turn' && ice.transport === 'tcp'),
          ...parsed
        ].map(ice => ice?.url).filter((url?: string): url is string => url != null).slice(0, 3);
      }
    });
    return iceServers;
  }
}

function removeFirst<T>(array: T[], predicate: (t: T) => boolean): T | undefined {
  const index = array.findIndex(predicate);
  if (index > -1)
    return array.splice(index, 1)[0];
}

function parseIceServerUrl(url: string): {
  url: string, protocol?: string, port?: string, transport?: string
} {
  const match = url.match(/^(stun|turn|turns):[\w-.]+(?::(\d+))?(?:\?transport=(tcp|udp))?/);
  if (match != null) {
    const [url, protocol, port, transport] = match;
    return { url, protocol, port, transport };
  } else {
    return { url };
  }
}
