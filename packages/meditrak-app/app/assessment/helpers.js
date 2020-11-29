/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

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

  const { _conjunction: conjunction, hidden, ...restOfCriteria } = visibilityCriteria;
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

export const getDefaultEntitySettingKey = (userId, entityTypes, countryId) =>
  `DEFAULT_ENTITY_${userId}_${countryId}_${entityTypes.join('_')}`;

export const getEntityCreationQuestions = questions =>
  questions.filter(({ config }) => config.entity && config.entity.createNew);

export const getOptionCreationAutocompleteQuestions = questions =>
  questions.filter(({ config }) => config.autocomplete && config.autocomplete.createNew);
