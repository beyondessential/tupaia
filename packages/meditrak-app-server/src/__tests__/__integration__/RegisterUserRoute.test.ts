import { TestableServer } from '@tupaia/server-boilerplate';
import { setupTestApp } from '../utilities';

const mockResponseMsg = 'Successfully created user';

describe('user', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp({
      central: {
        async registerUserAccount(userFields: Record<string, unknown>) {
          return { message: mockResponseMsg, id: userFields.id };
        },
      },
    });
  });

  describe('/user (register user)', () => {
    it('it invokes registerUser() on the CentralApi', async () => {
      const userId = '1234';
      const user = { id: userId };
      const response = await app.post('user', {
        body: user,
      });

      expect(response.body).toEqual({ message: mockResponseMsg, id: userId });
    });
  });
});
