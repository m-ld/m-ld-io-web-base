/**
 * Types from @vercel/node/dist/types
 * Inlined here to avoid runtime dependency on @vercel/node
 * @see https://vercel.com/docs/runtimes#official-runtimes/node-js/using-type-script-with-the-node-js-runtime
 * @see https://github.com/vercel/vercel/blob/main/LICENSE
 */

/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';

export declare type VercelRequestCookies = {
    [key: string]: string;
};
export declare type VercelRequestQuery = {
    [key: string]: string | string[];
};
export declare type VercelRequestBody = any;
export declare type VercelRequest = IncomingMessage & {
    query: VercelRequestQuery;
    cookies: VercelRequestCookies;
    body: VercelRequestBody;
};
export declare type VercelResponse = ServerResponse & {
    send: (body: any) => VercelResponse;
    json: (jsonBody: any) => VercelResponse;
    status: (statusCode: number) => VercelResponse;
    redirect: (statusOrUrl: string | number, url?: string) => VercelResponse;
};
export declare type VercelApiHandler = (req: VercelRequest, res: VercelResponse) => void;
