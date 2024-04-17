/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useParams } from 'react-router-dom';
import { SurveyScreenComponentConfig } from '@tupaia/types';
import { useSurveyForm } from '../../Survey';

export const useEntityBaseFilters = (config: SurveyScreenComponentConfig) => {
  const { getAnswerByQuestionId } = useSurveyForm();
  const { countryCode } = useParams();

  const filters = { countryCode } as Record<string, string | string[]>;

  const filter = config?.entity?.filter;
  if (!filter) {
    return filters;
  }

  const { parentId, grandparentId, type, attributes } = filter;

  if (type) {
    filters.type = type.join(',');
  }

  if (parentId && parentId.questionId) {
    filters['parentId'] = getAnswerByQuestionId(parentId.questionId);
  }
  if (grandparentId && grandparentId.questionId) {
    filters['grandparentId'] = getAnswerByQuestionId(grandparentId.questionId);
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, attrConfig]) => {
      const filterValue = getAnswerByQuestionId(attrConfig.questionId);
      filters[`attributes->>${key}`] = filterValue;
    });
  }
  return filters;
};
