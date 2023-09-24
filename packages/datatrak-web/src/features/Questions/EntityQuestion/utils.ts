/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useSurveyForm } from '../../Survey/SurveyContext';

// Todo: Remove this once we have a way to get the country id for the survey (WAITP-1431)
const getCountryCode = () => 'DL';

export const useEntityBaseFilters = config => {
  const { getAnswerForQuestion } = useSurveyForm();
  const countryCode = getCountryCode();
  const { parentId, grandparentId, type } = config.entity;

  const filters = { countryCode, type };

  if (parentId && parentId.questionId) {
    filters['parentId'] = getAnswerForQuestion(parentId.questionId);
  }
  if (grandparentId && grandparentId.questionId) {
    filters['grandparentId'] = getAnswerForQuestion(grandparentId.questionId);
  }
  return filters;
};
