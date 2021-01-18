/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
      BCD1: { name: 'Population' },
      BCD2: { name: 'Comment' },
    },
    dimensions: {
      pe: [],
      ou: ['tonga_dhisId'],
      BCD1: [],
      BCD2: [],
    },
  },
  width: 7,
  height: 2,
  rows: [
    [
      'event1_dhisId',
      '2020-02-06T10:18:00.000',
      'Nukunuku',
      'TO_Nukuhc',
      'nukunuku_dhisId',
      '10.0',
      'Comment 1',
    ],
    [
      'event2_dhisId',
      '2020-02-07T14:33:00.000',
      'Haveluloto',
      'TO_HvlMCH',
      'houma_dhisId',
      '20.0',
      'Comment 2',
    ],
  ],
};

export const EVENT_ANALYTICS_NO_DATA_VALUES = {
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
    ['event1_dhisId', '2020-02-06T10:18:00.000', 'Nukunuku', 'TO_Nukuhc', 'nukunuku_dhisId'],
    ['event2_dhisId', '2020-02-07T14:33:00.000', 'Haveluloto', 'TO_HvlMCH', 'houma_dhisId'],
  ],
};

export const EVENT_ANALYTICS_EMPTY_ROWS = {
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
      BCD1: { name: 'Population' },
      BCD2: { name: 'Comment' },
    },
    dimensions: {
      pe: [],
      ou: ['tonga_dhisId'],
      BCD1: [],
      BCD2: [],
    },
  },
  width: 7,
  height: 0,
  rows: [],
};

export const EVENT_ANALYTICS = {
  withDataValues: EVENT_ANALYTICS_WITH_DATA_VALUES,
  noDataValues: EVENT_ANALYTICS_NO_DATA_VALUES,
  emptyRows: EVENT_ANALYTICS_EMPTY_ROWS,
};
