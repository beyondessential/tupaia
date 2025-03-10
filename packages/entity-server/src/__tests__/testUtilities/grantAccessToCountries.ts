import { Authenticator } from '@tupaia/auth';

const PUBLIC_PERMISSION_GROUP = 'Public';

export const grantAccessToCountries = (countries: string[]) => {
  const policy = Object.fromEntries(countries.map(country => [country, [PUBLIC_PERMISSION_GROUP]]));
  return grantAccess(policy);
};

let getAccessPolicyForUserMock: jest.SpyInstance;
export const grantAccess = (policy: Record<string, string[]>) => {
  getAccessPolicyForUserMock = jest
    .spyOn(Authenticator.prototype, 'getAccessPolicyForUser')
    .mockImplementation(async () => policy);
};

export const revokeCountryAccess = () => {
  getAccessPolicyForUserMock.mockRestore();
};
