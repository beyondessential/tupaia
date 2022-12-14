/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

/**
 * @param  {...any} args
 * @returns {Moment}
 */
export const utcMoment = (...args) => moment.utc(...args);
