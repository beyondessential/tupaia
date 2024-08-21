/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import keyBy from 'lodash.keyby';
import { useCurrentUserContext, useEntityAncestors } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { getAllSurveyComponents, getParentQuestionId } from './utils';
import { SurveyScreenComponent, Entity } from '../../../types';

// Get the parent question ancestors recursively for the primary entity question
const getEntityQuestionAncestorAnswers = (
  question: SurveyScreenComponent,
  questionsById: Record<string, SurveyScreenComponent>,
  ancestorsByType: Record<string, Entity>,
): Record<string, string> => {
  const ancestor = ancestorsByType[question?.config?.entity?.filter?.type?.[0] ?? ''];
  if (!ancestor) return {};

  const parentQuestionId = getParentQuestionId(question);
  const parentQuestion = parentQuestionId ? questionsById[parentQuestionId] : null;

  const record = { [question.id as string]: ancestor.id };
  if (!parentQuestion) return record;

  return {
    ...record,
    ...getEntityQuestionAncestorAnswers(parentQuestion, questionsById, ancestorsByType),
  };
};

/**
 * Gets the answers for the primary entity question and its ancestors if the primary entity is pre-set for a survey
 */
export const usePrimaryEntityQuestionAutoFill = (primaryEntityCode?: Entity['code']) => {
  const user = useCurrentUserContext();
  const { primaryEntityQuestion, surveyScreens } = useSurveyForm();
  const { data: ancestors } = useEntityAncestors(user.project?.code, primaryEntityCode);

  if (!ancestors) {
    return {};
  }

  const questions = getAllSurveyComponents(surveyScreens);

  return getEntityQuestionAncestorAnswers(
    primaryEntityQuestion as SurveyScreenComponent,
    keyBy(questions, 'id'),
    keyBy(ancestors, 'type'),
  );
};
