/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const SINGLE_ANALYTIC = [
  { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
];

export const SINGLE_EVENT = [
  { eventId: '1234abcd', eventDate: '20200101', orgUnit: 'TO', orgUnitName: 'Tonga', BCD1: 4 },
];

export const MULTIPLE_ANALYTICS = [
  { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
  { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
  { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
];

export const TRANSFORMED_SUMMARY_BINARY = [
  { dataElement: 'Male condoms', TO: 'N', FJ: 'N', NR: 'Y', KI: 'N' },
  { dataElement: 'Female condoms', TO: 'N', FJ: 'Y', NR: 'Y', KI: 'Y' },
  { dataElement: 'Injectable contraceptives', TO: 'Y', FJ: 'Y' },
];

export const TRANSFORMED_SUMMARY_VARIOUS = [
  { dataElement: 'Male condoms', TO: 'Yes', FJ: 'N', NR: 'Y', KI: 'N' },
  { dataElement: 'Female condoms', TO: 'N', FJ: 'Y', NR: 'Y', KI: 'Y' },
  { dataElement: 'Injectable contraceptives', TO: 'Y', FJ: 'Y' },
];

export const MERGEABLE_ANALYTICS = [
  { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
  { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
  { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
  { period: '20200101', organisationUnit: 'TO', BCD2: 11 },
  { period: '20200102', organisationUnit: 'TO', BCD2: 1 },
  { period: '20200103', organisationUnit: 'TO', BCD2: 0 },
  { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
  { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
  { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
  { period: '20200101', organisationUnit: 'PG', BCD2: 13 },
  { period: '20200102', organisationUnit: 'PG', BCD2: 99 },
  { period: '20200103', organisationUnit: 'PG', BCD2: -1 },
];

export const MULTIPLE_MERGEABLE_ANALYTICS = [
  { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
  { period: '20200101', organisationUnit: 'TO', BCD1: 7 },
  { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
  { period: '20200102', organisationUnit: 'TO', BCD1: 12 },
  { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
  { period: '20200103', organisationUnit: 'TO', BCD1: 23 },
  { period: '20200101', organisationUnit: 'TO', BCD2: 11 },
  { period: '20200101', organisationUnit: 'TO', BCD2: 4 },
  { period: '20200102', organisationUnit: 'TO', BCD2: 1 },
  { period: '20200102', organisationUnit: 'TO', BCD2: 18 },
  { period: '20200103', organisationUnit: 'TO', BCD2: 0 },
  { period: '20200103', organisationUnit: 'TO', BCD2: 9 },
  { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
  { period: '20200101', organisationUnit: 'PG', BCD1: 17 },
  { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
  { period: '20200102', organisationUnit: 'PG', BCD1: 4 },
  { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
  { period: '20200103', organisationUnit: 'PG', BCD1: 1 },
  { period: '20200101', organisationUnit: 'PG', BCD2: 13 },
  { period: '20200101', organisationUnit: 'PG', BCD2: 23 },
  { period: '20200102', organisationUnit: 'PG', BCD2: 99 },
  { period: '20200102', organisationUnit: 'PG', BCD2: -4 },
  { period: '20200103', organisationUnit: 'PG', BCD2: -1 },
  { period: '20200103', organisationUnit: 'PG', BCD2: 12 },
];

export const MERGEABLE_ANALYTICS_WITH_NULL_VALUES = [
  { period: '20200101', organisationUnit: 'TO', BCD1: null },
  { period: '20200101', organisationUnit: 'PG', BCD2: null },
];

export const UNIQUE_MERGEABLE_ANALYTICS = [
  { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
  { period: '20200102', organisationUnit: 'TO', BCD1: 4 },
  { period: '20200103', organisationUnit: 'TO', BCD1: 4 },
  { period: '20200101', organisationUnit: 'TO', BCD2: 11 },
  { period: '20200102', organisationUnit: 'TO', BCD2: 1 },
  { period: '20200103', organisationUnit: 'TO', BCD2: 0 },
  { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
  { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
  { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
  { period: '20200101', organisationUnit: 'PG', BCD2: 99 },
  { period: '20200102', organisationUnit: 'PG', BCD2: 99 },
  { period: '20200103', organisationUnit: 'PG', BCD2: 99 },
];

export const SINGLE_MERGEABLE_ANALYTICS = [
  { period: '20200101', BCD1: 4 },
  { period: '20200101', BCD2: 4 },
  { period: '20200101', BCD3: 4 },
];

export const SORTABLE_ANALYTICS = [
  { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
  { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
  { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
  { period: '20200101', organisationUnit: 'TO', BCD1: 11 },
  { period: '20200102', organisationUnit: 'TO', BCD1: 1 },
  { period: '20200103', organisationUnit: 'TO', BCD1: 0 },
  { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
  { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
  { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
  { period: '20200101', organisationUnit: 'PG', BCD1: 13 },
  { period: '20200102', organisationUnit: 'PG', BCD1: 99 },
  { period: '20200103', organisationUnit: 'PG', BCD1: -1 },
];

export const EXCLUDEABLE_ANALYTICS = [
  { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
  { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
  { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
  { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
  { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
  { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
];

export const PARSABLE_ANALYTICS = [
  { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
  { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
  { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
  { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
  { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
  { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
];

export const DATE_COLUMNS = [
  {
    organisationUnit: 'Tonga',
    '2nd Aug 2022': 1,
    '13th Jan 2022': 2,
    'Sep 2022': 3,
    'Q1 2021': 4,
  },
];

export const PERIOD_COLUMNS = [
  {
    organisationUnit: 'Tonga',
    '20220802': 1,
    '2022W03': 2,
    '202209': 3,
    '2021Q1': 4,
  },
];
