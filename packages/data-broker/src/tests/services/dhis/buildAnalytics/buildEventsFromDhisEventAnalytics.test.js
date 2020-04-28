import { expect } from 'chai';

import { buildEventsFromDhisEventAnalytics } from '../../../../services/dhis/buildAnalytics/buildEventsFromDhisEventAnalytics';

const DHIS_EVENT_ANALYTICS = {
  headers: [
    { name: 'psi', column: 'Event', valueType: 'TEXT' },
    { name: 'eventdate', column: 'Event date', valueType: 'DATE' },
    { name: 'ouname', column: 'Organisation unit name', valueType: 'TEXT' },
    { name: 'oucode', column: 'Organisation unit code', valueType: 'TEXT' },
    { name: 'ou', column: 'Organisation unit', valueType: 'TEXT' },
    { name: 'POPULATION', column: 'Population', valueType: 'NUMBER' },
    { name: 'COMMENTS', column: 'Comments', valueType: 'TEXT' },
  ],
  metaData: {
    items: {
      tonga_dhisId: { name: 'Tonga' },
      ou: { name: 'Organisation unit' },
      program_dhisId: { name: 'Population Survey' },
      POPULATION: { name: 'Population' },
    },
    dimensions: {
      pe: [],
      ou: ['tonga_dhisId'],
      POPULATION: [],
    },
  },
  width: 7,
  height: 2,
  rows: [
    [
      'event1_dhisId',
      '2020-02-06 10:18:00.0',
      'Nukunuku',
      'TO_Nukuhc',
      'nukunuku_dhisId',
      '10.0',
      'Comment 1',
    ],
    [
      'event2_dhisId',
      '2020-02-06 14:33:00.0',
      'Haveluloto',
      'TO_HvlMCH',
      'houma_dhisId',
      '20.0',
      'Comment 2',
    ],
  ],
};

describe('buildEventsFromDhisEventAnalytics()', () => {
  it('should allow empty data element codes', () => {
    expect(() => buildEventsFromDhisEventAnalytics(DHIS_EVENT_ANALYTICS)).to.not.throw();
    expect(() => buildEventsFromDhisEventAnalytics(DHIS_EVENT_ANALYTICS, [])).to.not.throw();
  });

  it('should build events from DHIS2 event analytics', () => {
    expect(buildEventsFromDhisEventAnalytics(DHIS_EVENT_ANALYTICS, ['POPULATION'])).to.deep.equal([
      {
        eventId: 'event1_dhisId',
        organisationUnit: 'TO_Nukuhc',
        period: '20200206',
        values: {
          POPULATION: 10,
        },
      },
      {
        eventId: 'event2_dhisId',
        organisationUnit: 'TO_HvlMCH',
        period: '20200206',
        values: {
          POPULATION: 20.0,
        },
      },
    ]);
  });
});
