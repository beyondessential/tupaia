/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useUserCountries } from '../../../utils';
import { useSurveyForm } from '../../Survey/SurveyContext';

export const useEntityBaseFilters = config => {
  const { getAnswerForQuestion } = useSurveyForm();
  const { selectedCountry } = useUserCountries();
  const { parentId, grandparentId, type } = config.entity;

  const filters = { countryCode: selectedCountry?.code, type };

  if (parentId && parentId.questionId) {
    filters['parentId'] = getAnswerForQuestion(parentId.questionId);
  }
  if (grandparentId && grandparentId.questionId) {
    filters['grandparentId'] = getAnswerForQuestion(grandparentId.questionId);
  }
  return filters;
};
