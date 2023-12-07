import { PermissionsError } from '@tupaia/utils';
import { TestableServer } from '@tupaia/server-boilerplate';
import { setupTestApp } from './testUtilities';

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
    app = await setupTestApp();
  });

  describe('User Route', () => {
    it('Returns data', async () => {
      const response = await app.get('getUser');

      // Forbidden error
      expect(response.statusCode).toEqual(200);
      console.log('response', response.body);
      // expect(response.body).toEqual({ error: 'Permission denied' });
    });
  });
});
