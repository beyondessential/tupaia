/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { addMetadataToEvents } from '/apiV1/dataBuilders/helpers/eventMetadata';
import { EVENTS, ORG_UNITS } from './eventMetadata.fixtures';

export const testAddMetadataToEvents = () => {
  const models = {
    entity: {
      find: sinon
        .stub()
        .callsFake(({ code }) =>
          ORG_UNITS.filter(({ code: currentCode }) => code.includes(currentCode)),
        ),
    },
  };

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
  describe('base functionality', () => {
    it('should add metadata to events with data values', async () => {
      const events = [EVENTS.objectDataValues];
      const eventsWithMetadata = await addMetadataToEvents(models, events, ['$eventOrgUnitName']);

      expect(eventsWithMetadata).to.be.like(events);
      expect(eventsWithMetadata[0].dataValues).to.have.property('$eventOrgUnitName');
    });

    it('should add metadata to events with no data values', async () => {
      const events = [EVENTS.objectNoDataValues];
      const eventsWithMetadata = await addMetadataToEvents(models, events, ['$eventOrgUnitName']);

      expect(eventsWithMetadata).to.be.like(events);
      expect(eventsWithMetadata[0].dataValues).to.have.property('$eventOrgUnitName');
    });
  });

  describe('metadata keys', () => {
    describe('$eventOrgUnitName', () => {
      it('should use the name of the event org unit', async () => {
        const events = [EVENTS.objectDataValues];
        const eventsWithMetadata = await addMetadataToEvents(models, events, ['$eventOrgUnitName']);

        expect(eventsWithMetadata).to.deep.equal([
          {
            orgUnit: 'TO_Nukunuku',
            dataValues: {
              CD1: 1,
              CD2: 2,
              $eventOrgUnitName: 'Nukunuku',
            },
          },
        ]);
      });

      it('should use an empty string if the org unit is not found', async () => {
        const events = [EVENTS.unknownOrgUnit];
        const eventsWithMetadata = await addMetadataToEvents(models, events, ['$eventOrgUnitName']);

        expect(eventsWithMetadata).to.deep.equal([
          {
            orgUnit: 'Unknown_Org_Unit',
            dataValues: {
              CD1: 3,
              CD2: 6,
              $eventOrgUnitName: '',
            },
          },
        ]);
      });
    });
  });
};
