/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useUser } from '../../../api/queries';
import { useSurveyForm } from '../../Survey/SurveyContext';

export const useEntityBaseFilters = config => {
  const { getAnswerForQuestion } = useSurveyForm();
  const { data: user } = useUser();
  const { parentId, grandparentId, type } = config.entity;

  const filters = { countryCode: user?.country?.code, type };

  if (parentId && parentId.questionId) {
    filters['parentId'] = getAnswerForQuestion(parentId.questionId);
  }
  if (grandparentId && grandparentId.questionId) {
    filters['grandparentId'] = getAnswerForQuestion(grandparentId.questionId);
  }
  return filters;
};
