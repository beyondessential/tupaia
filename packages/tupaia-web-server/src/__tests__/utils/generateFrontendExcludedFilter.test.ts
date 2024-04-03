/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaWebServerModelRegistry } from '../../types';
import { generateFrontendExcludedFilter, getTypesToExclude } from '../../utils';

const COUNTRIES = [
  {
    code: 'AU',
    name: 'Australia',
  },
  {
    code: 'FJ',
    name: 'Fiji',
  },
  {
    code: 'TO',
    name: 'Tonga',
  },
];

const PROJECT = {
  code: 'test',
  config: {
    frontendExcluded: [
      {
        types: ['household'],
        exceptions: {
          permissionGroups: ['Admin'],
        },
      },
    ],
  },
};

const ACCESS_POLICY = {
  getPermissionGroups: jest.fn().mockReturnValue(['Admin']),
} as unknown as AccessPolicy;

const TestModels = {
  country: {
    find: jest.fn().mockResolvedValue(COUNTRIES),
  },
  project: {
    find: jest.fn().mockResolvedValue([PROJECT]),
  },
  entity: {
    typesExcludedFromWebFrontend: ['case'],
  },
} as unknown as TupaiaWebServerModelRegistry;

describe('generateFrontendExcludedFilter', () => {
  describe('getTypesToExclude', () => {
    it('Throws an error if project is not found', async () => {
      await expect(
        getTypesToExclude(
          {
            ...TestModels,
            project: {
              find: jest.fn().mockResolvedValue([]),
            },
          } as unknown as TupaiaWebServerModelRegistry,
          ACCESS_POLICY,
          'nonexistent',
        ),
      ).rejects.toThrowError("Project with code 'nonexistent' not found");
    });

    it('Returns typesExcludedFromWebFrontend if project does not have any frontendExcluded types and useDefaultIfNoExclusions param is not false', async () => {
      await expect(
        getTypesToExclude(
          {
            ...TestModels,
            project: {
              find: jest.fn().mockResolvedValue([
                {
                  ...PROJECT,
                  config: {},
                },
              ]),
            },
          } as unknown as TupaiaWebServerModelRegistry,
          ACCESS_POLICY,
          PROJECT.code,
        ),
      ).resolves.toEqual(['case']);
    });

    it('Returns [] if project does not have any frontendExcluded types and useDefaultIfNoExclusions param is false', async () => {
      await expect(
        getTypesToExclude(
          {
            ...TestModels,
            project: {
              find: jest.fn().mockResolvedValue([
                {
                  ...PROJECT,
                  config: {},
                },
              ]),
            },
          } as unknown as TupaiaWebServerModelRegistry,
          ACCESS_POLICY,
          PROJECT.code,
          false,
        ),
      ).resolves.toEqual([]);
    });

    it('Returns all the excluded types if there are no permissions exceptions on them', async () => {
      await expect(
        getTypesToExclude(
          {
            ...TestModels,
            project: {
              find: jest.fn().mockResolvedValue([
                {
                  ...PROJECT,
                  config: {
                    frontendExcluded: [
                      {
                        types: ['household'],
                      },
                    ],
                  },
                },
              ]),
            },
          } as unknown as TupaiaWebServerModelRegistry,
          ACCESS_POLICY,
          PROJECT.code,
        ),
      ).resolves.toEqual(['household']);
    });

    it('Returns the excluded types if the user does not have the permissions to view the excluded types on the project', async () => {
      await expect(
        getTypesToExclude(
          TestModels,
          {
            getPermissionGroups: jest.fn().mockReturnValue(['Public']),
          } as unknown as AccessPolicy,
          PROJECT.code,
        ),
      ).resolves.toEqual(['household']);
    });

    it('Returns an empty array if the user does have the permissions to view the excluded types on the project and the useDefaultIfNoExclusions param is false', async () => {
      await expect(
        getTypesToExclude(TestModels, ACCESS_POLICY, PROJECT.code, false),
      ).resolves.toEqual([]);
    });

    it('Returns the default excluded types if the user does have the permissions to view the excluded types on the project and the useDefaultIfNoExclusions param is not false', async () => {
      await expect(getTypesToExclude(TestModels, ACCESS_POLICY, PROJECT.code)).resolves.toEqual([
        'case',
      ]);
    });
  });

  describe('generateFrontendExcludedFilter', () => {
    it('Returns a formatted filter with the result of getTypesToExclude if the result is of length > 0', async () => {
      await expect(
        generateFrontendExcludedFilter(TestModels, ACCESS_POLICY, PROJECT.code),
      ).resolves.toEqual({
        type: {
          comparator: '!=',
          comparisonValue: ['case'],
        },
      });
    });

    it('Returns an empty object if there are no types to exclude', async () => {
      await expect(
        generateFrontendExcludedFilter(
          {
            ...TestModels,
            entity: {
              typesExcludedFromWebFrontend: [],
            },
          } as unknown as TupaiaWebServerModelRegistry,
          ACCESS_POLICY,
          PROJECT.code,
        ),
      ).resolves.toEqual({});
    });
  });
});
