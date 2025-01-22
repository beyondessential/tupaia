import { get, post, put, remove } from '../api';

export const getWeeklyReports = options => get('weekly-reports', options);

export const saveSiteReport = data => post('site-report', { data });

export const saveCountryReport = data => post('country-report', { data });

export const confirmWeeklyReport = data => post('weekly-report', { data });

export const createNote = data => post('notes', { data });

export const updateNote = data => put('notes', { data });

export const deleteNote = data => remove('notes', { data });
