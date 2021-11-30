/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { EventModel, EventType } from '../../modelClasses/Event';

describe('Event', () => {
  describe('sanitizeConfig()', () => {
    const database = {
      fetchSchemaForTable: () => {},
    };

    const createEvent = ({ serviceType = 'tupaia', config }) =>
      new EventType(new EventModel(database), {
        service_type: serviceType,
        config,
      });

    const assertConfigIsSanitized = ({ serviceType }, config, expectedConfig) => {
      const event = createEvent({ serviceType, config });
      event.sanitizeConfig();
      expect(event.config).to.deep.equal(expectedConfig);
    };

    it('dhis service', () => {
      assertConfigIsSanitized(
        {
          type: 'dataGroup',
          serviceType: 'dhis',
        },
        {
          dataElementCode: 'newCode',
          isDataRegional: true,
          other: 'random',
        },
        { isDataRegional: true },
      );
    });

    it('tupaia service', () => {
      assertConfigIsSanitized(
        {
          type: 'dataGroup',
          serviceType: 'tupaia',
        },
        { isDataRegional: false, other: 'random' },
        {},
      );
    });
  });
});
