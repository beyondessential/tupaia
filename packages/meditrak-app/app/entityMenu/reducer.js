/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import { COUNTRY_SELECT } from '../country/constants';
import { SURVEY_SELECT } from '../assessment/constants';
import { ENTITY_RECEIVE_ENTITIES, ENTITY_RECEIVE_PRIMARY_ENTITIES } from './constants';
import { LOGIN_REQUEST } from '../authentication';

const defaultState = {
  questions: {},
};

function updateEntities({ filteredEntities, questionId }, { questions }) {
  const question = questions[questionId] || {};
  return {
    questions: {
      ...questions,
      [questionId]: {
        ...question,
        filteredEntities,
      },
    },
  };
}

const stateChanges = {
  [ENTITY_RECEIVE_ENTITIES]: updateEntities,
  [ENTITY_RECEIVE_PRIMARY_ENTITIES]: updateEntities,
  // reset all questions but not primary entity
  [SURVEY_SELECT]: (payload, { filteredEntities }) => ({
    filteredEntities,
    questions: {},
  }),
  // complete reset
  [LOGIN_REQUEST]: () => defaultState,
  [COUNTRY_SELECT]: () => defaultState,
};

export const reducer = createReducer(defaultState, stateChanges);
