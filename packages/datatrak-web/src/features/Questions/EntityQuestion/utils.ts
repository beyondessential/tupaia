/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useSurveyForm } from '../../Survey/SurveyContext';

// Todo: Remove this once we have a way to get the country id for the survey (WAITP-1431)
const getCountryCode = () => 'TO';

export const useEntityBaseFilters = config => {
  const { getAnswerForQuestion } = useSurveyForm();
  const countryCode = getCountryCode();
  const { parentId, grandparentId, type } = config.entity;

  const filters = { countryCode, type };

  if (parentId && parentId.questionId) {
    filters['parent.id'] = getAnswerForQuestion(parentId.questionId);
  }
  if (grandparentId && grandparentId.questionId) {
    filters['parent.parent.id'] = getAnswerForQuestion(grandparentId.questionId);
  }
  return filters;
};
