export const EVENT_ANALYTICS_WITH_DATA_VALUES = {
  headers: [
    { name: 'psi', column: 'Event', valueType: 'TEXT' },
    { name: 'eventdate', column: 'Event date', valueType: 'DATE' },
    { name: 'ouname', column: 'Organisation unit name', valueType: 'TEXT' },
    { name: 'oucode', column: 'Organisation unit code', valueType: 'TEXT' },
    { name: 'ou', column: 'Organisation unit', valueType: 'TEXT' },
    { name: 'BCD1', column: 'BCD1', valueType: 'NUMBER' },
    { name: 'BCD2', column: 'BCD2', valueType: 'TEXT' },
  ],
  metaData: {
    items: {
      tonga_dhisId: { name: 'Tonga' },
      ou: { name: 'Organisation unit' },
      program_dhisId: { name: 'BCD1 Survey' },
      BCD1: { name: 'BCD1' },
    },
    dimensions: {
      pe: [],
      ou: ['tonga_dhisId'],
      BCD1: [],
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

export const EVENT_ANALYTICS_WITHOUT_DATA_VALUES = {
  headers: [
    { name: 'psi', column: 'Event', valueType: 'TEXT' },
    { name: 'eventdate', column: 'Event date', valueType: 'DATE' },
    { name: 'ouname', column: 'Organisation unit name', valueType: 'TEXT' },
    { name: 'oucode', column: 'Organisation unit code', valueType: 'TEXT' },
    { name: 'ou', column: 'Organisation unit', valueType: 'TEXT' },
  ],
  metaData: {
    items: {
      tonga_dhisId: { name: 'Tonga' },
      ou: { name: 'Organisation unit' },
      program_dhisId: { name: 'BCD1 Survey' },
    },
    dimensions: {
      pe: [],
      ou: ['tonga_dhisId'],
    },
  },
  width: 5,
  height: 2,
  rows: [
    ['event1_dhisId', '2020-02-06 10:18:00.0', 'Nukunuku', 'TO_Nukuhc', 'nukunuku_dhisId'],
    ['event2_dhisId', '2020-02-06 14:33:00.0', 'Haveluloto', 'TO_HvlMCH', 'houma_dhisId'],
  ],
};
