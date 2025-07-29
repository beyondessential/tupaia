import { keyBy } from 'es-toolkit/compat';
import { useCurrentUserContext, useEntityAncestors } from '../../../api';
import { getParentQuestionId } from './utils';
import { SurveyScreenComponent, Entity } from '../../../types';

// Get the parent question ancestors recursively for the primary entity question
export const getEntityQuestionAncestorAnswers = (
  question: SurveyScreenComponent,
  questionsById: Record<string, SurveyScreenComponent>,
  ancestorsByType: Record<string, Entity>,
): Record<string, string> => {
  const answer = ancestorsByType[question?.config?.entity?.filter?.type?.[0] ?? ''];
  if (!answer) return {};

  const parentQuestionId = getParentQuestionId(question);
  const parentQuestion = parentQuestionId ? questionsById[parentQuestionId] : null;

  const record = { [question.id as string]: answer.id };
  if (!parentQuestion) return record;

  return {
    ...record,
    ...getEntityQuestionAncestorAnswers(parentQuestion, questionsById, ancestorsByType),
  };
};

/**
 * Gets the answers for the primary entity question and its ancestors if the primary entity is pre-set for a survey
 */
export const usePrimaryEntityQuestionAutoFill = (
  primaryEntityQuestion: SurveyScreenComponent,
  questions: SurveyScreenComponent[],
  primaryEntityCode?: Entity['code'],
) => {
  const user = useCurrentUserContext();
  const { data = {}, ...query } = useEntityAncestors(user.project?.code, primaryEntityCode);

  const ancestors = data
    ? getEntityQuestionAncestorAnswers(
        primaryEntityQuestion as SurveyScreenComponent,
        keyBy(questions, 'id'),
        keyBy(data, 'type'),
      )
    : {};

  return {
    ...query,
    data: ancestors,
  };
};
