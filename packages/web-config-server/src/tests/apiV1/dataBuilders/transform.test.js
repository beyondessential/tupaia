/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

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
    findOne: sinon.stub().callsFake(({ code }) => ORG_UNITS[code] || null),
  },
};

describe('transform', () => {
  describe('transformValue()', () => {
    it('should throw an error for an invalid transformation type', async () =>
      expect(transformValue(models, 'invalidType')).to.be.rejectedWith('Invalid transformation'));

    describe('transformation: orgUnitCodeToName', () => {
      it('should return the name of an org unit given its code', async () =>
        expect(transformValue(models, 'orgUnitCodeToName', ORG_UNITS.FJ.code)).to.eventually.equal(
          ORG_UNITS.FJ.name,
        ));

      it('should use the input if the org unit is not found', async () =>
        expect(transformValue(models, 'orgUnitCodeToName', 'wrongCode')).to.eventually.equal(
          'wrongCode',
        ));
    });
  });

  describe('transformObject()', () => {
    it('should return an empty object if none/empty object is provided', async () => {
      await Promise.all(
        [undefined, null, {}].map(async object => {
          const result = await transformObject(models, 'orgUnitCodeToName', object);
          expect(result).to.deep.equal({});
        }),
      );
    });

    describe('transformation: orgUnitCodeToName', () => {
      it('should transform org unit codes to names', async () =>
        expect(
          transformObject(models, 'orgUnitCodeToName', {
            site1: ORG_UNITS.FJ.code,
            site2: ORG_UNITS.PG.code,
            site3: 'noMatchingOrgUnit',
          }),
        ).to.eventually.deep.equal({
          site1: ORG_UNITS.FJ.name,
          site2: ORG_UNITS.PG.name,
          site3: 'noMatchingOrgUnit',
        }));
    });
  });
});
