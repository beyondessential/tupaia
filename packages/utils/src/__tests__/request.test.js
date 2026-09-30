import { createServer } from 'node:http';
import { fetchWithTimeout, stringifyQuery } from '../request';

describe('request', () => {
  const BASE_URL = 'https://test-api.org';
  const ENDPOINT = 'reports';

  describe('fetchWithTimeout()', () => {
    beforeEach(() => {
      // mock fetch takes 20 ms to resolve, and rejects if aborted before then
      jest.spyOn(global, 'fetch').mockImplementation(
        (_url, { signal }) =>
          new Promise((resolve, reject) => {
            const id = setTimeout(() => resolve('success'), 20);
            signal.addEventListener('abort', () => {
              clearTimeout(id);
              reject(signal.reason);
            });
          }),
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('resolves with request response if request is fast enough', async () => {
      return expect(fetchWithTimeout(BASE_URL, {}, 40)).resolves.toEqual('success');
    });

    it('throws an error if request is too slow', () => {
      return expect(fetchWithTimeout(BASE_URL, {}, 10)).rejects.toThrow(/request timed out/);
    });
  });

  describe('fetchWithTimeout() against a real server', () => {
    const TIMEOUT = 100;
    const CHUNKS = ['chunk0\n', 'chunk1\n', 'chunk2\n', 'chunk3\n', 'chunk4\n'];
    let server;
    let baseUrl;

    beforeAll(async () => {
      server = createServer((req, res) => {
        if (req.url === '/slow-headers') {
          const timeout = setTimeout(() => {
            res.writeHead(200);
            res.end('too late');
          }, TIMEOUT * 3);
          res.on('close', () => clearTimeout(timeout)); // client aborted
          return;
        }
        // '/slow-body': headers straight away, then a body that takes well over TIMEOUT
        res.writeHead(200, { 'content-type': 'text/plain' });
        let i = 0;
        const interval = setInterval(() => {
          res.write(CHUNKS[i]);
          i++;
          if (i === CHUNKS.length) {
            clearInterval(interval);
            res.end();
          }
        }, TIMEOUT * 0.6);
        res.on('close', () => clearInterval(interval)); // client aborted
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    afterAll(async () => {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    });

    it('times out waiting for response headers', () => {
      return expect(fetchWithTimeout(`${baseUrl}/slow-headers`, {}, TIMEOUT)).rejects.toThrow(
        /request timed out/,
      );
    });

    it('does not time out a response body that takes longer than the timeout', async () => {
      const response = await fetchWithTimeout(`${baseUrl}/slow-body`, {}, TIMEOUT);
      expect(await response.text()).toBe(CHUNKS.join(''));
    });

    it('still honours an abort signal passed by the caller', () => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), TIMEOUT / 4);
      return expect(
        fetchWithTimeout(`${baseUrl}/slow-headers`, { signal: controller.signal }, TIMEOUT),
      ).rejects.toMatchObject({ name: 'AbortError' });
    });
  });

  describe('stringifyQuery()', () => {
    const testData = [
      [
        'no query params',
        [
          [undefined, 'https://test-api.org/reports'],
          [null, 'https://test-api.org/reports'],
          [{}, 'https://test-api.org/reports'],
        ],
      ],
      [
        '`undefined` params',
        [
          [{ a: undefined }, 'https://test-api.org/reports'],
          [{ a: 1, b: undefined }, 'https://test-api.org/reports?a=1'],
          [{ a: undefined, b: 2 }, 'https://test-api.org/reports?b=2'],
        ],
      ],
      [
        '`null` params',
        [
          [{ a: null }, 'https://test-api.org/reports'],
          [{ a: 1, b: null }, 'https://test-api.org/reports?a=1'],
          [{ a: null, b: 2 }, 'https://test-api.org/reports?b=2'],
        ],
      ],
      ['one query param', [[{ a: 1 }, 'https://test-api.org/reports?a=1']]],
      ['two query params', [[{ a: 1, b: 2 }, 'https://test-api.org/reports?a=1&b=2']]],
      [
        'special characters',
        [
          [{ a: '=test' }, 'https://test-api.org/reports?a=%3Dtest'],
          [{ '%value': 0.3 }, 'https://test-api.org/reports?%25value=0.3'],
          [{ '%value': '=test' }, 'https://test-api.org/reports?%25value=%3Dtest'],
        ],
      ],
      [
        'array query param',
        [
          [{ a: [1] }, 'https://test-api.org/reports?a=1'],
          [{ a: [1, 2] }, 'https://test-api.org/reports?a=1&a=2'],
        ],
      ],
      [
        'array query param with special characters',
        [
          [{ a: [1, '=test'] }, 'https://test-api.org/reports?a=1&a=%3Dtest'],
          [{ '%value': [0.63, 1] }, 'https://test-api.org/reports?%25value=0.63&%25value=1'],
          [{ '%value': [1, '=test'] }, 'https://test-api.org/reports?%25value=1&%25value=%3Dtest'],
        ],
      ],
    ];

    it.each(testData)('%s', (_, testCaseData) => {
      testCaseData.forEach(([queryParams, expected]) => {
        expect(stringifyQuery(BASE_URL, ENDPOINT, queryParams)).toBe(expected);
      });
    });
  });
});
