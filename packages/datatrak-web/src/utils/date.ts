/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

export const shortDate = (date: Date) => {
  return moment(date).format('DD/MMM/YYYY');
};
