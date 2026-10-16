import { DhisFetcher } from '../DhisFetcher';

jest.mock('../authenticateWithDhis', () => ({
  authenticateWithDhis: async () => ({
    token: { access_token: 'token', expires_at: new Date(Date.now() + 60 * 1000) },
  }),
}));

const constructError = message => new Error(message);

describe('DhisFetcher', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('fetch', () => {
    it('resolves to an empty object for a DELETE with an empty response body', async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
      const fetcher = new DhisFetcher('test', 'https://dhis.test', constructError);

      await expect(fetcher.fetch('events/abc', {}, { method: 'DELETE' })).resolves.toEqual({});
    });

    it('throws for a GET with an empty response body', async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
      const fetcher = new DhisFetcher('test', 'https://dhis.test', constructError);

      await expect(fetcher.fetch('events/abc')).rejects.toThrow();
    });
  });
});
