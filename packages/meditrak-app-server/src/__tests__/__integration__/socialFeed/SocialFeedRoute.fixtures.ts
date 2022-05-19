/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

export const GONDOR = {
  name: 'Gondor',
  code: 'GND',
};

export const MORDOR = {
  name: 'Mordor',
  code: 'MOR',
};

export const COUNTRIES = [GONDOR, MORDOR];

// Sorted by creation_date desc
export const FEED_ITEMS = [
  {
    country: MORDOR.code,
    type: 'SurveyResponse',
    creation_date: '2020-01-04 00:00:00.000+1100',
  },
  {
    country: GONDOR.code,
    type: 'SurveyResponse',
    creation_date: '2020-01-03 00:00:00.000+1100',
  },
  {
    country: GONDOR.code,
    type: 'markdown',
    creation_date: '2020-01-02 00:00:00.000+1100',
  },
  {
    country: null,
    type: 'SurveyResponse',
    creation_date: '2020-01-01 00:00:00.000+1100',
  },
];
