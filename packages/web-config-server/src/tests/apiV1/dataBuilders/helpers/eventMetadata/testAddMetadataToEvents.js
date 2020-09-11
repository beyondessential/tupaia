/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { addMetadataToEvents } from '/apiV1/dataBuilders/helpers/eventMetadata';
import { EVENTS, ORG_UNITS } from './eventMetadata.fixtures';

export const testAddMetadataToEvents = () => {
  const models = {};
  it('should throw an error if an invalid key has been provided', async () => {
    const assertErrorIsThrownForKeys = async keys =>
      expect(addMetadataToEvents(models, [EVENTS.objectDataValue], keys)).to.be.rejectedWith(
        'Invalid metadata key',
      );

    await assertErrorIsThrownForKeys(['invalidKey']);
    return assertErrorIsThrownForKeys(['$eventOrgUnitName', 'invalidKey']);
  });

  it('should return the events input if no metadata keys are provided', async () => {
    const events = [EVENTS.objectDataValue1];
    await expect(addMetadataToEvents(models, events)).to.eventually.deep.equal(events);
    return expect(addMetadataToEvents(models, events, [])).to.eventually.deep.equal(events);
  });

  it('should return an empty array if no events are provided', async () => {
    await expect(addMetadataToEvents(models, [])).to.eventually.deep.equal([]);
    await expect(addMetadataToEvents(models, [], [])).to.eventually.deep.equal([]);
    return expect(addMetadataToEvents(models, [], ['$eventOrgUnitName'])).to.eventually.deep.equal(
      [],
    );
  });

  /**
   * This block uses `$eventOrgUnitName` as a metadata key to assert generic behaviour
   * of addMetadataToEvents(). Specific value calculations per metadata key should be
   * asserted in their corresponding test blocks
   */
  describe('functionality per data value type', () => {
    describe('object', () => {
      it('should add metadata to events', () => {
        const events = [EVENTS.objectDataValue];

        return expect(
          addMetadataToEvents(models, events, ['$eventOrgUnitName']),
        ).to.eventually.be.like([
          {
            orgUnit: 'TO_Nukunuku',
            dataValues: {
              CD1: { storedBy: 'User1', dataElement: 'CD1', value: 1 },
              $eventOrgUnitName: { storedBy: 'User1', dataElement: '$eventOrgUnitName' },
            },
          },
        ]);
      });

      it('should not include value metadata if data values are empty', async () => {
        const events = [EVENTS.objectNoDataValues];

        await expect(
          addMetadataToEvents(models, events, ['$eventOrgUnitName']),
        ).to.eventually.be.like([
          {
            orgUnit: 'TO_Nukunuku',
            dataValues: {
              $eventOrgUnitName: { dataElement: '$eventOrgUnitName' },
            },
          },
        ]);
      });

      it('should include the value metadata of the first data value', () => {
        const events = [EVENTS.objectDataValues];

        return expect(
          addMetadataToEvents(models, events, ['$eventOrgUnitName']),
        ).to.eventually.be.like([
          {
            orgUnit: 'TO_Nukunuku',
            dataValues: {
              CD1: { storedBy: 'User1', dataElement: 'CD1', value: 1 },
              CD2: { storedBy: 'User2', dataElement: 'CD2', value: 2 },
              $eventOrgUnitName: { storedBy: 'User1', dataElement: '$eventOrgUnitName' },
            },
          },
        ]);
      });
    });

    describe('array', () => {
      it('should add metadata to events', () => {
        const events = [EVENTS.arrayDataValue];

        return expect(
          addMetadataToEvents(models, events, ['$eventOrgUnitName']),
        ).to.eventually.be.like([
          {
            orgUnit: 'TO_Nukunuku',
            dataValues: [
              { storedBy: 'User1', dataElement: 'CD1', value: 1 },
              { storedBy: 'User1', dataElement: '$eventOrgUnitName' },
            ],
          },
        ]);
      });

      it('should not include value metadata if data values are empty', async () => {
        const events = [EVENTS.arrayNoDataValues];

        await expect(
          addMetadataToEvents(models, events, ['$eventOrgUnitName']),
        ).to.eventually.be.like([
          {
            orgUnit: 'TO_Nukunuku',
            dataValues: [{ dataElement: '$eventOrgUnitName' }],
          },
        ]);
      });

      it('should include the value metadata of the first data value', () => {
        const events = [EVENTS.arrayDataValues];

        return expect(
          addMetadataToEvents(models, events, ['$eventOrgUnitName']),
        ).to.eventually.be.like([
          {
            orgUnit: 'TO_Nukunuku',
            dataValues: [
              { storedBy: 'User1', dataElement: 'CD1', value: 1 },
              { storedBy: 'User2', dataElement: 'CD2', value: 2 },
              { storedBy: 'User1', dataElement: '$eventOrgUnitName' },
            ],
          },
        ]);
      });
    });
  });

  describe('metadata keys', () => {
    describe('$eventOrgUnitName', () => {
      const modelsWithStubbedEntity = {
        entity: {
          find: sinon
            .stub()
            .callsFake(({ code }) =>
              ORG_UNITS.filter(({ code: currentCode }) => code.includes(currentCode)),
            ),
        },
      };

      it('should use the name of the event org unit', () => {
        const events = [EVENTS.objectDataValue];

        return expect(
          addMetadataToEvents(modelsWithStubbedEntity, events, ['$eventOrgUnitName']),
        ).to.eventually.deep.equal([
          {
            orgUnit: 'TO_Nukunuku',
            dataValues: {
              CD1: { storedBy: 'User1', dataElement: 'CD1', value: 1 },
              $eventOrgUnitName: {
                storedBy: 'User1',
                dataElement: '$eventOrgUnitName',
                value: 'Nukunuku',
              },
            },
          },
        ]);
      });

      it('should use an empty string if the org unit is not found', () => {
        const events = [EVENTS.unknownOrgUnit];

        return expect(
          addMetadataToEvents(modelsWithStubbedEntity, events, ['$eventOrgUnitName']),
        ).to.eventually.deep.equal([
          {
            orgUnit: 'Unknown_Org_Unit',
            dataValues: {
              CD1: { storedBy: 'User3', dataElement: 'CD1', value: 3 },
              $eventOrgUnitName: {
                storedBy: 'User3',
                dataElement: '$eventOrgUnitName',
                value: '',
              },
            },
          },
        ]);
      });
    });
  });
};
