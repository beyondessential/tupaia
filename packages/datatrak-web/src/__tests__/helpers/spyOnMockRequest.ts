import { matchRequestUrl, MockedRequest } from 'msw';
import { SetupServer } from 'msw/node';

export function spyOnMockRequest(server: SetupServer, method: string, url: string) {
  return new Promise<MockedRequest>(resolve => {
    server.events.on('request:match', req => {
      const matchesMethod = req.method.toLowerCase() === method.toLowerCase();
      const matchesUrl = matchRequestUrl(req.url, url).matches;

      if (matchesUrl && matchesMethod) {
        resolve(req);
      }
    });
  });
}
