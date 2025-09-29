/**
 * Checks whether all prior questions had the relevant answers enabling this question to be visible,
 * based on visibity criteria object in the format:
 * {
 *   _conjunction: 'and'/'or', // Optional, if not provided default to 'or'
 *   questionId1: ['answer1', 'answer2'],
 *   questionId2: ['answer1'],
 * }
 * Where for each question, we check whether that question has been answered with one of the options
 * in the array. The criteria will be met if at least one prior question has been answered with a
 * relevant option, or in the case of _conjunction: 'and', all prior questions have been answered
 * with a relevant option.
 * @param {object} state The redux state tree
 * @param {object} visibilityCriteria An object representing answers required to prior questions
 */
export const checkAnswerPreconditionsAreMet = (answers, visibilityCriteria) => {
  if (!visibilityCriteria) {
    return true;
  }

  const { _conjunction: conjunction, hidden: _, ...restOfCriteria } = visibilityCriteria;
  if (Object.keys(restOfCriteria).length === 0) {
    return true;
  }

  const checkIfQuestionMeetsCriteria = ([questionId, answersEnablingFollowUp]) =>
    answersEnablingFollowUp.includes(answers[questionId]);

  return conjunction === 'and'
    ? Object.entries(restOfCriteria).every(checkIfQuestionMeetsCriteria)
    : Object.entries(restOfCriteria).some(checkIfQuestionMeetsCriteria);
};

export const doesScreenHaveValidationErrors = screen =>
  screen && screen.components.some(({ validationErrorMessage }) => !!validationErrorMessage);

export const getRecentEntitiesSettingKey = (userId, entityTypes, countryId) => {
  return `RECENT_ENTITIES_${userId}_${countryId}_${entityTypes.join('_')}`;
};

export const getRecentEntityIds = (database, userId, entityTypes, countryId) =>
  JSON.parse(
    database.getSetting(getRecentEntitiesSettingKey(userId, entityTypes, countryId)) || '[]',
  );
const MAX_RECENT_ENTITIES = 3;
export const addRecentEntityId = (database, userId, entityTypes, countryId, entityId) => {
  const recentEntityIds = getRecentEntityIds(database, userId, entityTypes, countryId);
  const updatedRecentEntityIds = [entityId, ...recentEntityIds.filter(id => id !== entityId)].slice(
    0,
    MAX_RECENT_ENTITIES,
  );
  database.setSetting(
    getRecentEntitiesSettingKey(userId, entityTypes, countryId),
    JSON.stringify(updatedRecentEntityIds),
  );
};

export const getEntityCreationQuestions = questions =>
  questions.filter(({ config }) => config.entity && config.entity.createNew);

export const getUpsertEntityQuestions = questions =>
  questions.filter(({ config }) => {
    if (config.entity) {
      if (config.entity.createNew) {
        return true;
      }
      const hasFieldsConfig = config.entity.fields
        ? Object.keys(config.entity.fields).length > 0
        : false;
      return hasFieldsConfig;
    }
    return false;
  });

export const getEntityUpdateQuestions = questions => {
  const relevantQuestions = questions.filter(({ config }) => {
    if (config.entity && !config.entity.createNew) {
      const hasFieldsConfig = config.entity.fields
        ? Object.keys(config.entity.fields).length > 0
        : false;
      return hasFieldsConfig;
    }
    return false;
  });
  return relevantQuestions;
};

export const getQrCodeGenerationQuestions = questions =>
  getEntityCreationQuestions(questions).filter(({ config }) => config.entity?.generateQrCode);

export const getOptionCreationAutocompleteQuestions = questions =>
  questions.filter(({ config }) => config.autocomplete && config.autocomplete.createNew);
