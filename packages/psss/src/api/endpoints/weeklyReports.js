/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { get, post } from '../api';

export const getWeeklyReports = options => get('weekly-reports', options);

export const saveSiteReport = data => post('site-report', { data });

export const saveCountryReport = data => post('country-report', { data });

export const confirmWeeklyReport = data => post('weekly-report', { data });
