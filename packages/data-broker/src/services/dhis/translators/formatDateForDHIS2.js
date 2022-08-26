/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

const formatDate = (date, format) => moment.parseZone(date).format(format);

export const formatDateForDHIS2 = date => formatDate(date, 'YYYY-MM-DD');
export const formatDateTimeForDHIS2 = date => formatDate(date, 'YYYY-MM-DDTHH:mm:ss');
