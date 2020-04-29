/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import moment from 'moment-timezone';

const DATE_FORMAT = 'YYYY-MM-DD';

export const formatDateForApi = (date, timezone) => {
  if (!date) return undefined;
  const dateAsMoment = moment(date);
  if (timezone) dateAsMoment.tz(timezone);
  return dateAsMoment.format(DATE_FORMAT);
};
