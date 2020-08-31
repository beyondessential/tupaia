/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';

export const StartDateCell = ({ startDate }) => {
  return format(startDate, 'LLL d, yyyy');
};
