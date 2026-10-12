import type { Response as ExpressResponse } from 'express';
import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import { PassThrough } from 'node:stream';

import { ApiConnection } from '../../connections/ApiConnection';

const TIMEOUT = 100;
const SLOW_BODY_CHUNKS = ['chunk0\n', 'chunk1\n', 'chunk2\n', 'chunk3\n', 'chunk4\n'];

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const sendJson = (res: ServerResponse, status: number, json: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(json));
};

const routes: Record<string, (req: IncomingMessage, res: ServerResponse) => void> = {
  '/json': async (req, res) => {
    const body = await readBody(req);
    sendJson(res, 200, {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: body ? JSON.parse(body) : null,
    });
  },
  '/text': (_req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('plain text');
  },
  '/no-content': (_req, res) => {
    res.writeHead(204);
    res.end();
  },
  '/slow-headers': (_req, res) => {
    setTimeout(() => {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end('too late');
    }, TIMEOUT * 3);
  },
  '/slow-body': (_req, res) => {
    // Headers straight away, then a body that takes well over TIMEOUT to finish
    res.writeHead(200, { 'content-type': 'text/plain' });
    let i = 0;
    const interval = setInterval(() => {
      res.write(SLOW_BODY_CHUNKS[i++]);
      if (i === SLOW_BODY_CHUNKS.length) {
        clearInterval(interval);
        res.end();
      }
    }, TIMEOUT * 0.6);
  },
  '/die-mid-stream': (_req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.write('partial\n');
    setTimeout(() => res.socket?.destroy(), 20);
  },
  '/error-json': (_req, res) => sendJson(res, 500, { error: 'Something broke' }),
  '/error-html': (_req, res) => {
    res.writeHead(502, { 'content-type': 'text/html' });
    res.end('<html>Bad gateway</html>');
  },
};

const collect = (stream: PassThrough) => {
  let data = '';
  stream.on('data', chunk => {
    data += chunk;
  });
  return () => data;
};

describe('ApiConnection', () => {
  let server: Server;
  let baseUrl: string;
  let connection: ApiConnection;

  const authHandler = { getAuthHeader: async () => 'Bearer test-token' };

  beforeAll(async () => {
    server = createServer((req, res) => {
      const path = new URL(req.url ?? '/', 'http://localhost').pathname;
      const handler = routes[path];
      if (!handler) {
        res.writeHead(404);
        res.end();
        return;
      }
      handler(req, res);
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    connection = new ApiConnection(authHandler, baseUrl, { timeout: TIMEOUT });
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  });

  describe('requests', () => {
    it('sends auth and content-type headers', async () => {
      const { headers } = await connection.get('json');
      expect(headers).toMatchObject({
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
      });
    });

    it('sends header overrides', async () => {
      const withOverrides = new ApiConnection(authHandler, baseUrl, {
        headers: { 'X-Client-Version': '1.2.3' },
      });
      const { headers } = await withOverrides.get('json');
      expect(headers).toMatchObject({ 'x-client-version': '1.2.3' });
    });

    it('stringifies query parameters', async () => {
      const { url } = await connection.get('json', { a: 1, b: 'two', c: ['x', 'y'] });
      expect(decodeURIComponent(url)).toBe('/json?a=1&b=two&c[0]=x&c[1]=y');
    });

    it('omits the query string when there are no query parameters', async () => {
      const { url } = await connection.get('json');
      expect(url).toBe('/json');
    });

    it.each([
      ['post', 'POST'],
      ['put', 'PUT'],
    ] as const)('%s sends a JSON body', async (method, httpMethod) => {
      const response = await connection[method]('json', null, { hello: 'world' });
      expect(response).toMatchObject({ method: httpMethod, body: { hello: 'world' } });
    });

    it('delete sends a DELETE request', async () => {
      const { method } = await connection.delete('json');
      expect(method).toBe('DELETE');
    });

    it('returns the raw response for non-JSON content', async () => {
      const response = await connection.get('text');
      expect(response).toBeInstanceOf(Response);
      expect(await response.text()).toBe('plain text');
    });

    it('throws with the error message from a JSON error response', async () => {
      await expect(connection.get('error-json')).rejects.toMatchObject({
        name: 'CustomError',
        statusCode: 500,
        message: 'API error 500: Something broke',
      });
    });

    it('throws with the status of an HTML error response', async () => {
      await expect(connection.get('error-html')).rejects.toMatchObject({
        name: 'CustomError',
        statusCode: 502,
      });
    });
  });

  describe('timeout', () => {
    it('times out waiting for response headers', async () => {
      const error = await connection.get('slow-headers').catch(e => e);
      expect(error.name).toBe('TimeoutError');
      expect(error.message).toContain(`${baseUrl}/slow-headers`);
      expect(error.message).toContain('timed out');
    });

    it('does not time out a response body that takes longer than the timeout', async () => {
      const response = await connection.get('slow-body');
      expect(await response.text()).toBe(SLOW_BODY_CHUNKS.join(''));
    });
  });

  describe('pipeStream', () => {
    it('pipes the response body to the destination', async () => {
      const destination = new PassThrough();
      const getData = collect(destination);
      await connection.pipeStream(destination as unknown as ExpressResponse, 'text');
      expect(getData()).toBe('plain text');
    });

    it('does not time out a stream that takes longer than the timeout', async () => {
      const destination = new PassThrough();
      const getData = collect(destination);
      await connection.pipeStream(destination as unknown as ExpressResponse, 'slow-body');
      expect(getData()).toBe(SLOW_BODY_CHUNKS.join(''));
    });

    it('rejects and destroys the destination if the upstream dies mid-stream', async () => {
      const destination = new PassThrough();
      collect(destination);
      await expect(
        connection.pipeStream(destination as unknown as ExpressResponse, 'die-mid-stream'),
      ).rejects.toThrow();
      expect(destination.destroyed).toBe(true);
    });

    it('throws if there is no response body', async () => {
      const destination = new PassThrough();
      await expect(
        connection.pipeStream(destination as unknown as ExpressResponse, 'no-content'),
      ).rejects.toThrow('No response body to stream from no-content');
    });
  });
});
