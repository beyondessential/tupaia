/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildEventsFromDhisEventAnalytics } from '../../../../services/dhis/buildAnalytics/buildEventsFromDhisEventAnalytics';
import { EVENT_ANALYTICS } from './buildAnalytics.fixtures';

describe('buildEventsFromDhisEventAnalytics()', () => {
  it('allows empty data element codes', () => {
    expect(() =>
      buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues),
    ).not.toThrowError();
    expect(() =>
      buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, []),
    ).not.toThrowError();
  });

  it('builds events containing no data values', () => {
    expect(buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS.noDataValues)).toStrictEqual([
      {
        event: 'event1_dhisId',
        orgUnit: 'TO_Nukuhc',
        orgUnitName: 'Nukunuku',
        eventDate: '2020-02-06T10:18:00.000',
        dataValues: {},
      },
      {
        event: 'event2_dhisId',
        orgUnit: 'TO_HvlMCH',
        orgUnitName: 'Haveluloto',
        eventDate: '2020-02-07T14:33:00.000',
        dataValues: {},
      },
    ]);
  });

  it('builds events from DHIS2 event analytics and sorts them by period', () => {
    expect(
      buildEventsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, ['BCD1', 'BCD2']),
    ).toStrictEqual([
      {
        event: 'event1_dhisId',
        orgUnit: 'TO_Nukuhc',
        orgUnitName: 'Nukunuku',
        eventDate: '2020-02-06T10:18:00.000',
        dataValues: {
          BCD1: 10,
          BCD2: 'Comment 1',
        },
      },
      {
        event: 'event2_dhisId',
        orgUnit: 'TO_HvlMCH',
        orgUnitName: 'Haveluloto',
        eventDate: '2020-02-07T14:33:00.000',
        dataValues: {
          BCD1: 20,
          BCD2: 'Comment 2',
        },
      },
    ]);
  });
});
