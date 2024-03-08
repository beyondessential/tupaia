/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment-timezone';

const formatDate = (date: string, format: string) => moment.parseZone(date).format(format);

export const formatDateForDHIS2 = (date: string) => formatDate(date, 'YYYY-MM-DD');
export const formatDateTimeForDHIS2 = (date: string) => formatDate(date, 'YYYY-MM-DDTHH:mm:ss');
