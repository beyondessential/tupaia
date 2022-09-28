/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { addMetadataToEvents } from '/apiV1/dataBuilders/helpers/eventMetadata';
import { EVENTS, ORG_UNITS } from './eventMetadata.fixtures';

export const testAddMetadataToEvents = () => {
  const models = {
    entity: {
      find: ({ code }) => ORG_UNITS.filter(({ code: currentCode }) => code.includes(currentCode)),
    },
  };

  it('should throw an error if an invalid key has been provided', async () => {
    const events = [EVENTS.objectDataValues];

    await expect(addMetadataToEvents(models, events, ['invalidKey'])).toBeRejectedWith(
      'Invalid metadata key',
    );
    await expect(
      addMetadataToEvents(models, events, ['$eventOrgUnitName', 'invalidKey']),
    ).toBeRejectedWith('Invalid metadata key');
  });

  it('should return the events input if no metadata keys are provided', async () => {
    const events = [EVENTS.objectDataValues];

    await Promise.all(
      [undefined, []].map(async metadataKeys => {
        const results = await addMetadataToEvents(models, events, metadataKeys);
        expect(results).toStrictEqual(events);
      }),
    );
  });

  it('should return an empty array if no events are provided', async () => {
    await Promise.all(
      [undefined, [], ['$eventOrgUnitName']].map(async metadataKeys => {
        const results = await addMetadataToEvents(models, [], metadataKeys);
        expect(results).toStrictEqual([]);
      }),
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

      expect(eventsWithMetadata).toMatchObject(events);
      expect(eventsWithMetadata[0].dataValues).toHaveProperty('$eventOrgUnitName');
    });

    it('should add metadata to events with no data values', async () => {
      const events = [EVENTS.objectNoDataValues];
      const eventsWithMetadata = await addMetadataToEvents(models, events, ['$eventOrgUnitName']);

      expect(eventsWithMetadata).toMatchObject(events);
      expect(eventsWithMetadata[0].dataValues).toHaveProperty('$eventOrgUnitName');
    });
  });

  describe('metadata keys', () => {
    describe('$eventOrgUnitName', () => {
      it('should use the name of the event org unit', async () => {
        const events = [EVENTS.objectDataValues];
        const eventsWithMetadata = await addMetadataToEvents(models, events, ['$eventOrgUnitName']);

        expect(eventsWithMetadata).toStrictEqual([
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

        expect(eventsWithMetadata).toStrictEqual([
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
