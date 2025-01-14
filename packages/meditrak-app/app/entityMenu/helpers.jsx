import { getAnswerForQuestion, getQuestion } from '../assessment/selectors';
import { getRecentEntityIds } from '../assessment/helpers';

export const getEntityBaseFilters = (state, database, questionId) => {
  // filtering for entities within the currently selected country also has the byproduct
  // of only including entities for which the user has permission - to be filling in a survey in a
  // country, they must have the associated permission group in that country
  const { code: countryCode } = database.getCountry(state.country.selectedCountryId);
  const filters = { countryCode };

  const question = getQuestion(state, questionId);

  const { filter } = question.config.entity;

  if (!filter) {
    return filters;
  }
  filters.type = filter.type;
  if (filter.parentId && filter.parentId.questionId) {
    filters['parent.id'] = getAnswerForQuestion(state, filter.parentId.questionId);
  }
  if (filter.grandparentId && filter.grandparentId.questionId) {
    filters['parent.parent.id'] = getAnswerForQuestion(state, filter.grandparentId.questionId);
  }

  return filters;
};

export const getEntityAttributeChecker = (state, questionId) => {
  const question = getQuestion(state, questionId);

  const { filter } = question.config.entity;
  if (!filter?.attributes) {
    return null;
  }

  return entity =>
    Object.entries(filter.attributes).every(([key, config]) => {
      const attributeValue = getAnswerForQuestion(state, config.questionId);

      // No answer was selected for the question to filter, return all
      if (attributeValue === undefined) {
        return true;
      }

      const { attributes: entityAttributes } = entity.toJson();
      return entityAttributes[key] === attributeValue;
    });
};

const filterOnAttributes = (entities, checkEntityAttributes) => {
  if (!checkEntityAttributes) {
    return entities;
  }

  return entities.filter(checkEntityAttributes);
};

export const getRecentEntities = (database, state, baseFilters) => {
  const { questions, primaryEntityQuestionId, assessorId } = state.assessment;
  const entityTypes = questions[primaryEntityQuestionId].config.entity.filter?.type || [];

  const recentEntityIds = getRecentEntityIds(
    database,
    assessorId,
    entityTypes,
    state.country.selectedCountryId,
  );
  if (recentEntityIds.length === 0) {
    return [];
  }
  const recentEntities = database.getEntities({ ...baseFilters, id: recentEntityIds });

  // sort database results to match our saved array of recent entity ids
  const sortedRecentEntities = recentEntities
    .slice() // need to slice to convert from RealmResults to standard array for sorting
    .sort((a, b) => recentEntityIds.indexOf(a.id) - recentEntityIds.indexOf(b.id));

  return sortedRecentEntities;
};

/*
 * This returns a js array, NOT a Realm.Results object
 * The attributes filter uses a [].filter which converts the results to value iterables
 */
export const fetchEntities = (database, baseFilters, checkEntityAttributes) => {
  const entities = database.getEntities(baseFilters);
  return filterOnAttributes(entities, checkEntityAttributes);
};
