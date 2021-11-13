import { URL } from 'url';
import { Fetch, FetchOptions } from '@zeit/fetch';
import { VercelResponse } from '@vercel/node';
import { LOG } from './logging';

// Using require() rather than import default to avoid having to use esModuleInterop
export const fetch: Fetch = require('@zeit/fetch')();

export class HttpError {
  constructor(
    private readonly statusCode: number,
    private readonly statusMessage: string) {
  }

  respond(res: VercelResponse): VercelResponse {
    if (this.statusCode >= 500) {
      LOG.warn(this);
      return res.status(500).send('Internal server error');
    } else {
      return res.status(this.statusCode).send(this.statusMessage);
    }
  }

  static respond(res: VercelResponse, err: any): VercelResponse {
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