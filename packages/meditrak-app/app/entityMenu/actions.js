/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import {
  ENTITY_SEARCH_TERM_CHANGE,
  ENTITY_RECEIVE_PRIMARY_ENTITIES,
  ENTITY_RECEIVE_ENTITIES,
} from './constants';
import { getEntityQuestionState, getAnswerForQuestion, getQuestion } from '../assessment/selectors';

const getPermsCheckFunction = (database, surveyId) => {
  const currentUser = database.getCurrentUser();
  const survey = database.findOne('Survey', surveyId);

  return entity => currentUser.hasAccessToSurveyInEntity(survey, entity);
};

const getEntityFilters = (state, database, questionId) => {
  const { code: countryCode } = database.getCountry(state.country.selectedCountryId);
  const filters = { countryCode };

  const question = getQuestion(state, questionId);
  const { parentId, grandparentId, type } = question.config.entity;
  filters.type = type;
  if (parentId && parentId.questionId) {
    filters['parent.id'] = getAnswerForQuestion(state, parentId.questionId);
  }
  if (grandparentId && grandparentId.questionId) {
    filters['parent.parent.id'] = getAnswerForQuestion(state, grandparentId.questionId);
  }

  return filters;
};

export const loadEntitiesFromDatabase = (isPrimaryEntity, questionId) => (
  dispatch,
  getState,
  { database },
) => {
  const state = getState();
  const { assessment } = state;

  // get search term
  const { searchTerm } = getEntityQuestionState(state, questionId);

  // check permissions - only for the PrimaryEntity questions
  const { surveyId } = assessment;
  const permsCheck = isPrimaryEntity ? getPermsCheckFunction(database, surveyId) : () => true;

  const filters = getEntityFilters(state, database, questionId);
  const entities = database.getEntities(searchTerm, filters);

  const filteredEntities = entities
    .filter(permsCheck)
    .map(thisEntity => thisEntity.getReduxStoreData());

  dispatch({
    type: isPrimaryEntity ? ENTITY_RECEIVE_PRIMARY_ENTITIES : ENTITY_RECEIVE_ENTITIES,
    filteredEntities,
    questionId,
  });
};

export const changeSearchTerm = (isPrimaryEntity, questionId, searchTerm) => async dispatch => {
  dispatch({
    type: ENTITY_SEARCH_TERM_CHANGE,
    searchTerm,
    questionId,
  });
  dispatch(loadEntitiesFromDatabase(isPrimaryEntity, questionId));
};
