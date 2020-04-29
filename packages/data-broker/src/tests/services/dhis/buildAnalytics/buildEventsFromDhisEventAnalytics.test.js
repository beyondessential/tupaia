import { expect } from 'chai';

import { buildEventsFromDhisEventAnalytics } from '../../../../services/dhis/buildAnalytics/buildEventsFromDhisEventAnalytics';
import {
  EVENT_ANALYTICS_WITH_DATA_VALUES,
  EVENT_ANALYTICS_WITHOUT_DATA_VALUES,
} from './buildEventsFromDhisEventAnalytics.fixtures';

describe('buildEventsFromDhisEventAnalytics()', () => {
  it('should allow empty data element codes', () => {
    expect(() =>
      buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS_WITH_DATA_VALUES),
    ).to.not.throw();
    expect(() =>
      buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS_WITH_DATA_VALUES, []),
    ).to.not.throw();
  });

  it('should build events containing no data values', () => {
    expect(buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS_WITHOUT_DATA_VALUES)).to.deep.equal([
      {
        eventId: 'event1_dhisId',
        organisationUnit: 'TO_Nukuhc',
        period: '20200206',
        values: {},
      },
      {
        eventId: 'event2_dhisId',
        organisationUnit: 'TO_HvlMCH',
        period: '20200206',
        values: {},
      },
    ]);
  });

  it('should build events from DHIS2 event analytics', () => {
    expect(
      buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS_WITH_DATA_VALUES, ['BCD1', 'BCD2']),
    ).to.deep.equal([
      {
        eventId: 'event1_dhisId',
        organisationUnit: 'TO_Nukuhc',
        period: '20200206',
        values: {
          BCD1: 10,
          BCD2: 'Comment 1',
        },
      },
      {
        eventId: 'event2_dhisId',
        organisationUnit: 'TO_HvlMCH',
        period: '20200206',
        values: {
          BCD1: 20.0,
          BCD2: 'Comment 2',
        },
      },
    ]);
  });
});
