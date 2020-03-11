/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

export const formatDateForDHIS2 = date => moment.parseZone(date).format('YYYY-MM-DD');
