/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaWebServerModelRegistry } from '../../types';
import { generateFrontendExcludedFilter, getTypesToExclude } from '../../utils';

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
      {
        types: ['case'],
      },
    ],
  },
};

const ACCESS_POLICY = {
  allowsAnywhere: jest.fn().mockReturnValue(true),
} as unknown as AccessPolicy;

const TestModels = {
  project: {
    findOne: jest.fn().mockResolvedValue(PROJECT),
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
              findOne: jest.fn().mockResolvedValue(null),
            },
          } as unknown as TupaiaWebServerModelRegistry,
          ACCESS_POLICY,
          'nonexistent',
        ),
      ).rejects.toThrowError("Project with code 'nonexistent' not found");
    });

    it('Returns [] if project does not have any frontendExcluded types', async () => {
      await expect(
        getTypesToExclude(
          {
            ...TestModels,
            project: {
              findOne: jest.fn().mockResolvedValue({
                ...PROJECT,
                config: {},
              }),
            },
          } as unknown as TupaiaWebServerModelRegistry,
          ACCESS_POLICY,
          PROJECT.code,
        ),
      ).resolves.toEqual([]);
    });

    it('Returns all the excluded types if there are no permissions exceptions on them', async () => {
      await expect(
        getTypesToExclude(
          {
            ...TestModels,
            project: {
              findOne: jest.fn().mockResolvedValue({
                ...PROJECT,
                config: {
                  frontendExcluded: [
                    {
                      types: ['household'],
                    },
                    {
                      types: ['case'],
                    },
                  ],
                },
              }),
            },
          } as unknown as TupaiaWebServerModelRegistry,
          ACCESS_POLICY,
          PROJECT.code,
        ),
      ).resolves.toEqual(['household', 'case']);
    });

    it('Returns the excluded types if the user does not have the permissions to view the excluded types on the project', async () => {
      await expect(
        getTypesToExclude(
          TestModels,
          {
            allowsAnywhere: jest.fn().mockReturnValue(false),
          } as unknown as AccessPolicy,
          PROJECT.code,
        ),
      ).resolves.toEqual(['household', 'case']);
    });

    it('Returns only the types the user does not have permission to view', async () => {
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
            project: {
              findOne: jest.fn().mockResolvedValue({
                ...PROJECT,
                config: {},
              }),
            },
          } as unknown as TupaiaWebServerModelRegistry,
          ACCESS_POLICY,
          PROJECT.code,
        ),
      ).resolves.toEqual({});
    });
  });
});
