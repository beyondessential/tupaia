/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { ENTITY_RECEIVE_PRIMARY_ENTITIES, ENTITY_RECEIVE_ENTITIES } from './constants';
import { getAnswerForQuestion, getQuestion } from '../assessment/selectors';
import { getRecentEntityIds } from '../assessment/helpers';

const getEntityDatabaseFilters = (state, database, questionId) => {
  // filtering for entities within the currently selected country also has the byproduct
  // of only including entities for which the user has permission - to be filling in a survey in a
  // country, they must have the associated permission group in that country
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

const getRecentEntities = (database, state, entityFilters) => {
  const { questions, primaryEntityQuestionId, assessorId } = state.assessment;
  const entityTypes = questions[primaryEntityQuestionId].config.entity.type;
  const recentEntityIds = getRecentEntityIds(
    database,
    assessorId,
    entityTypes,
    state.country.selectedCountryId,
  );
  if (recentEntityIds.length === 0) {
    return [];
  }

  const recentEntities = database.getEntities({ ...entityFilters, id: recentEntityIds });

  // sort database results to match our saved array of recent entity ids
  const sortedRecentEntities = recentEntities
    .slice() // need to slice to convert from RealmResults to standard array for sorting
    .sort((a, b) => recentEntityIds.indexOf(a.id) - recentEntityIds.indexOf(b.id));

  return sortedRecentEntities;
};

export const loadEntitiesFromDatabase = (isPrimaryEntity, questionId) => (
  dispatch,
  getState,
  { database },
) => {
  const state = getState();

  const filters = getEntityDatabaseFilters(state, database, questionId);
  const entities = database.getEntities(filters);

  // filter on attributes
  const checkMatchesAttributeFilters = getEntityAttributeFilters(state, questionId);
  const filteredEntities = entities.filter(checkMatchesAttributeFilters);

  const recentEntities = getRecentEntities(database, state, filters);

  dispatch({
    type: isPrimaryEntity ? ENTITY_RECEIVE_PRIMARY_ENTITIES : ENTITY_RECEIVE_ENTITIES,
    entities: filteredEntities.map(e => e.getReduxStoreData()),
    recentEntities,
    questionId,
  });
};
