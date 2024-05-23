/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const EDITOR_DATA_FETCH_BEGIN = 'EDITOR_DATA_FETCH_BEGIN';
export const EDITOR_DATA_FETCH_SUCCESS = 'EDITOR_DATA_FETCH_SUCCESS';
export const EDITOR_DATA_EDIT_BEGIN = 'EDITOR_DATA_EDIT_BEGIN';
export const EDITOR_DATA_EDIT_SUCCESS = 'EDITOR_DATA_EDIT_SUCCESS';
export const EDITOR_DISMISS = 'EDITOR_DISMISS';
export const EDITOR_ERROR = 'EDITOR_ERROR';
export const EDITOR_FIELD_EDIT = 'EDITOR_FIELD_EDIT';
export const LOAD_EDITOR = 'LOAD_EDITOR';

export const DATA_CHANGE_ACTIONS = {
  start: EDITOR_DATA_EDIT_BEGIN,
  finish: EDITOR_DATA_EDIT_SUCCESS,
  error: EDITOR_ERROR,
};

export const SECTION_FIELD_TYPE = 'section';
export const OPEN_EDIT_MODAL = 'OPEN_EDIT_MODAL';
export const RESET_EDITS = 'RESET_EDITS';
