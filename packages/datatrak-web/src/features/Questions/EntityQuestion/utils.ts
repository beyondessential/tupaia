/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useUser } from '../../../api/queries';
import { useSurveyForm } from '../../Survey/SurveyContext';

export const useEntityBaseFilters = config => {
  const { getAnswerByQuestionId } = useSurveyForm();
  const { data: userData } = useUser();
  const countryCode = userData?.country?.code;
  const { parentId, grandparentId, type } = config.entity;

  const filters = { countryCode, type };

  if (parentId && parentId.questionId) {
    filters['parentId'] = getAnswerByQuestionId(parentId.questionId);
  }
  if (grandparentId && grandparentId.questionId) {
    filters['grandparentId'] = getAnswerByQuestionId(grandparentId.questionId);
  }
  return filters;
};

type AttributesConfigType = { entity: { attributes: Record<string, { questionId: string }> } };

/*
 * Returns a function that filters entities based on configured attribute values and questions
 */
export const useAttributeFilter = (questionConfig: AttributesConfigType) => {
  const { getAnswerByQuestionId } = useSurveyForm();
  const { attributes: questionAttributes } = questionConfig.entity;
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
