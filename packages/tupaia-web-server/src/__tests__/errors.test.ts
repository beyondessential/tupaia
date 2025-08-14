import { TestableServer } from '@tupaia/server-boilerplate';
import { PermissionsError } from '@tupaia/utils';

jest.mock('@tupaia/api-client', () => {
  const { MockTupaiaApiClient } = jest.requireActual('@tupaia/api-client');
  return {
    TupaiaApiClient: jest.fn().mockImplementation(() => {
      return new MockTupaiaApiClient({
        entity: {
          getEntity: jest.fn(() => {
            throw new PermissionsError('Permission denied');
          }),
        },
      });
    }),
  };
});

describe('Error responses', () => {
  let app: TestableServer;

  beforeAll(async () => {
    // app = await setupTestApp();
  });

  describe('Microservice errors', () => {
    it.skip('Returns the original error from the backing server', async () => {
      const response = await app.get('entity/redblue/CINNABAR');

      // Forbidden error
      expect(response.statusCode).toEqual(403);
      expect(response.body).toEqual({ error: 'Permission denied' });
    });
  });
});
