/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const SINGLE_ANALYTIC = [
  { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
];

export const MULTIPLE_ANALYTICS = [
  { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
  { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
  { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
];

export const AGGREGATEABLE_ANALYTICS = [
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

export const UNIQUE_AGGREGATEABLE_ANALYTICS = [
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

export const SORTABLE_ANALYTICS = [
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

export const FILTERABLE_ANALYTICS = [
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
