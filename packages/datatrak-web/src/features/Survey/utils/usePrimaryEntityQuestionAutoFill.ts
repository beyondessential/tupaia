/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import keyBy from 'lodash.keyby';
import { useCurrentUserContext, useEntityAncestors } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { getAllSurveyComponents, getPrimaryQuestionAncestorAnswers } from './utils';

export const usePrimaryEntityQuestionAutoFill = primaryEntityCode => {
  const user = useCurrentUserContext();
  const { primaryEntityQuestion, surveyScreens } = useSurveyForm();
  const { data: ancestors } = useEntityAncestors(user.project?.code, primaryEntityCode);

  if (!ancestors) {
    return {};
  }

  const questions = getAllSurveyComponents(surveyScreens);

  return getPrimaryQuestionAncestorAnswers(
    primaryEntityQuestion,
    keyBy(questions, 'id'),
    keyBy(ancestors, 'type'),
  );
};
