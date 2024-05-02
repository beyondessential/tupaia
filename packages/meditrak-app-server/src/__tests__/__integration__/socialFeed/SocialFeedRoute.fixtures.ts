/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

export const GONDOR = {
  name: 'Gondor',
  code: 'GND',
};

export const MORDOR = {
  name: 'Mordor',
  code: 'MOR',
};

export const COUNTRIES = [GONDOR, MORDOR];

export const PERMISSION_GROUPS = [{ name: 'Public' }];

const formatFeedItemDate = (date: Date) => moment(date).format('YYYY-MM-DD HH:mm:ss.SSSZZ');
// Sorted by creation_date desc
export const FEED_ITEMS = [
  {
    country: MORDOR.code,
    type: 'SurveyResponse',
    creation_date: formatFeedItemDate(new Date('2020-01-04')),
  },
  {
    country: GONDOR.code,
    type: 'SurveyResponse',
    creation_date: formatFeedItemDate(new Date('2020-01-03')),
  },
  {
    country: GONDOR.code,
    type: 'markdown',
    creation_date: formatFeedItemDate(new Date('2020-01-02')),
  },
  {
    country: GONDOR.code,
    type: 'SurveyResponse',
    creation_date: formatFeedItemDate(new Date('2020-01-01')),
  },
];
