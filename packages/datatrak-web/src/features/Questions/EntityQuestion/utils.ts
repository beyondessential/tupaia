/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useUser } from '../../../api/queries';
import { useSurveyForm } from '../../Survey/SurveyContext';

type AttributesConfigType = {
  entity: {
    filter: {
      type: string[];
      grandparentId: { questionId: string };
      parentId: { questionId: string };
      attributes: Record<string, { questionId: string }>;
    };
  };
};
export const useEntityBaseFilters = (config: AttributesConfigType) => {
  const { getAnswerByQuestionId } = useSurveyForm();
  const { data: userData } = useUser();
  const countryCode = userData?.country?.code;

  const filters = { countryCode } as Record<string, string | string[]>;

  const { filter } = config.entity;
  if (!filter) {
    return filters;
  }

  const { parentId, grandparentId, type } = filter;
  filters.type = type;

  if (parentId && parentId.questionId) {
    filters['parentId'] = getAnswerByQuestionId(parentId.questionId);
  }
  if (grandparentId && grandparentId.questionId) {
    filters['grandparentId'] = getAnswerByQuestionId(grandparentId.questionId);
  }
  return filters;
};

/*
 * Returns a function that filters entities based on configured attribute values and questions
 */
export const useAttributeFilter = (questionConfig: AttributesConfigType) => {
  const { getAnswerByQuestionId } = useSurveyForm();
  const { attributes: questionAttributes } = questionConfig.entity?.filter;
  if (!questionAttributes) {
    return null;
  }

  const filterValues = Object.entries(questionAttributes).reduce((acc, [key, config]) => {
    // Get the answer from the configured question
    const filterValue = getAnswerByQuestionId(config.questionId);
    return filterValue ? acc : { ...acc, [key]: filterValue };
  }, {});

  // No answer was selected for the question to filter, return all
  if (Object.keys(filterValues).length === 0) {
    return null;
  }

  return entity =>
    Object.entries(filterValues).every(([key, value]) => {
      const { attributes: entityAttributes } = entity.toJson();
      return entityAttributes[key] === value;
    });
};
