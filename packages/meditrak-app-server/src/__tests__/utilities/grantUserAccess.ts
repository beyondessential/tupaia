import { Authenticator } from '@tupaia/auth';

export const BASIC_ACCESS = {
  DL: ['Public'],
};

let getAccessPolicyForUserMock: jest.SpyInstance;

export const grantUserAccess = (
  userId: string,
  accessPolicyObject: Record<string, string[]> = BASIC_ACCESS,
) => {
  getAccessPolicyForUserMock = jest
    .spyOn(Authenticator.prototype, 'getAccessPolicyForUser')
    .mockImplementation(async (id: string) => (id === userId ? accessPolicyObject : {}));
};

export const revokeAccess = () => {
  getAccessPolicyForUserMock.mockRestore();
};
