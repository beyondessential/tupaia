/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { buildEventsFromDhisEventAnalytics } from '../../../../services/dhis/buildAnalytics/buildEventsFromDhisEventAnalytics';
import { EVENT_ANALYTICS } from './buildAnalytics.fixtures';

describe('buildEventsFromDhisEventAnalytics()', () => {
  it('allows empty data element codes', () => {
    expect(() => buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues)).to.not.throw();
    expect(() =>
      buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, []),
    ).to.not.throw();
  });

  it('builds events containing no data values', () => {
    expect(buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS.noDataValues)).to.deep.equal([
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

  it('builds events from DHIS2 event analytics and sorts them by period', () => {
    expect(
      buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, ['BCD1', 'BCD2']),
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
        period: '20200207',
        values: {
          BCD1: 20,
          BCD2: 'Comment 2',
        },
      },
    ]);
  });
});
