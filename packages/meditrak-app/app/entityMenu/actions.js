/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { ENTITY_RECEIVE_PRIMARY_ENTITIES, ENTITY_RECEIVE_ENTITIES } from './constants';
import { getAnswerForQuestion, getQuestion } from '../assessment/selectors';

const getPermsCheckFunction = (database, surveyId) => {
  const currentUser = database.getCurrentUser();
  const survey = database.findOne('Survey', surveyId);

  return entity => currentUser.hasAccessToSurveyInEntity(survey, entity);
};

const getEntityDatabaseFilters = (state, database, questionId) => {
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

const getEntityAttributeFilters = (state, questionId) => {
  const question = getQuestion(state, questionId);
  const { attributes } = question.config.entity;

  return entity =>
    attributes
      ? Object.entries(attributes).every(([key, config]) => {
          const attributeValue = getAnswerForQuestion(state, config.questionId);

          // No answer was selected for the question to filter, return all
          if (attributeValue === undefined) {
            return true;
          }

          const { attributes: entityAttributes } = entity.toJson();
          return entityAttributes[key] === attributeValue;
        })
      : true;
};

export const loadEntitiesFromDatabase = (isPrimaryEntity, questionId) => (
  dispatch,
  getState,
  { database },
) => {
  const state = getState();
  const { assessment } = state;

  const filters = getEntityDatabaseFilters(state, database, questionId);
  const entities = database.getEntities(filters);

  // check permissions - only for the PrimaryEntity questions
  const { surveyId } = assessment;
  const permsCheck = isPrimaryEntity ? getPermsCheckFunction(database, surveyId) : () => true;
  const allowedEntities = entities.filter(permsCheck);

  // filter on attributes
  const checkMatchesAttributeFilters = getEntityAttributeFilters(state, questionId);
  const filteredEntities = allowedEntities.filter(checkMatchesAttributeFilters);

  dispatch({
    type: isPrimaryEntity ? ENTITY_RECEIVE_PRIMARY_ENTITIES : ENTITY_RECEIVE_ENTITIES,
    entities: filteredEntities.map(thisEntity => thisEntity.getReduxStoreData()),
    questionId,
  });
};
