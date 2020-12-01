/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { get, post, put, remove } from '../api';

export const getWeeklyReports = options => get('weekly-reports', options);

// Return empty sites data until real endpoint is complete
// @see https://github.com/beyondessential/tupaia-backlog/issues/1501
export const getSitesMetaData = () => ({
  name: '',
  sites: [],
  code: '',
  coords: [],
  contactDetails: {},
});

export const saveSiteReport = data => post('site-report', { data });

export const saveCountryReport = data => post('country-report', { data });

export const confirmWeeklyReport = data => post('weekly-report', { data });

export const createNote = data => post('notes', { data });

export const updateNote = data => put('notes', { data });

export const deleteNote = data => remove('notes', { data });
