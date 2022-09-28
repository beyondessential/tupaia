/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { transformValue, transformObject } from 'apiV1/dataBuilders/transform';

const ORG_UNITS = {
  FJ: {
    code: 'FJ',
    name: 'Fiji',
  },
  PG: {
    code: 'PG',
    name: 'Papua New Guinea',
  },
};

const models = {
  entity: {
    findOne: ({ code }) => ORG_UNITS[code] || null,
  },
};

describe('transform', () => {
  describe('transformValue()', () => {
    it('should throw an error for an invalid transformation type', async () => {
      await expect(transformValue(models, 'invalidType')).toBeRejectedWith(
        'Invalid transformation',
      );
    });

    describe('transformation: orgUnitCodeToName', () => {
      it('should return the name of an org unit given its code', async () => {
        const result = await transformValue(models, 'orgUnitCodeToName', ORG_UNITS.FJ.code);
        expect(result).toBe(ORG_UNITS.FJ.name);
      });

      it('should use the input if the org unit is not found', async () => {
        const result = await transformValue(models, 'orgUnitCodeToName', 'wrongCode');
        expect(result).toBe('wrongCode');
      });
    });
  });

  describe('transformObject()', () => {
    it('should return an empty object if none/empty object is provided', async () => {
      await Promise.all(
        [undefined, null, {}].map(async object => {
          const result = await transformObject(models, 'orgUnitCodeToName', object);
          expect(result).toStrictEqual({});
        }),
      );
    });

    describe('transformation: orgUnitCodeToName', () => {
      it('should transform org unit codes to names', async () => {
        const results = await transformObject(models, 'orgUnitCodeToName', {
          site1: ORG_UNITS.FJ.code,
          site2: ORG_UNITS.PG.code,
          site3: 'noMatchingOrgUnit',
        });
        expect(results).toStrictEqual({
          site1: ORG_UNITS.FJ.name,
          site2: ORG_UNITS.PG.name,
          site3: 'noMatchingOrgUnit',
        });
      });
    });
  });
});
