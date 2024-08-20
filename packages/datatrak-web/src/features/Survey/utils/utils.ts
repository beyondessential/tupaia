/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { QuestionType } from '@tupaia/types';
import { SurveyScreen, SurveyScreenComponent } from '../../../types';
import { EntityQuestionConfig } from '@tupaia/types/src';

const validateSurveyComponent = component => {
  if (component.type === QuestionType.PrimaryEntity && !component.config?.entity?.createNew) {
    component.validationCriteria = component.validationCriteria ?? {};
    component.validationCriteria.mandatory = true;
  }
  return component;
};

export const READ_ONLY_QUESTION_TYPES = [
  QuestionType.Condition,
  QuestionType.Arithmetic,
  QuestionType.Instruction,
  QuestionType.CodeGenerator,
];

export const getSurveyScreenNumber = (screens, screen) => {
  if (!screen) return null;
  const { surveyScreenComponents, id } = screen;
  const nonInstructionScreens =
    screens?.filter(screen =>
      screen.surveyScreenComponents.some(component => component.type !== QuestionType.Instruction),
    ) ?? [];

  const screenNumber = surveyScreenComponents.some(
    component => component.type !== QuestionType.Instruction,
  )
    ? nonInstructionScreens.findIndex(nonInstructionScreen => nonInstructionScreen.id === id) + 1
    : null;

  return screenNumber;
};

export const getAllSurveyComponents = (surveyScreens?: SurveyScreen[]) => {
  return (
    surveyScreens
      ?.flatMap(({ surveyScreenComponents }) => surveyScreenComponents)
      .map(validateSurveyComponent) ?? []
  );
};

export const getErrorsByScreen = (
  errors: Record<string, Record<string, string>>,
  visibleScreens?: SurveyScreen[],
) => {
  return (
    Object.entries(errors).reduce((acc, [questionName, error]) => {
      const screenIndex = visibleScreens?.findIndex(({ surveyScreenComponents }) =>
        surveyScreenComponents.find(question => question.questionId === questionName),
      );

      if (screenIndex === undefined || screenIndex === -1) return acc;
      const screenNum = screenIndex + 1;
      return {
        ...acc,
        [screenNum]: {
          ...acc[screenNum],
          [questionName]: error,
        },
      };
    }, {}) ?? {}
  );
};

const hasEntityQuestionConfig = (
  ssc: SurveyScreenComponent,
): ssc is SurveyScreenComponent & {
  config: { entity: EntityQuestionConfig };
} =>
  (ssc.type === QuestionType.Entity || ssc.type === QuestionType.PrimaryEntity) &&
  ssc.config?.entity !== undefined;

export const getParentQuestionId = (question: SurveyScreenComponent) =>
  hasEntityQuestionConfig(question) && question.config.entity?.filter?.parentId?.questionId;

export const getPrimaryQuestionAncestorAnswers = (question, questionsById, ancestorsByType) => {
  const filterType = question?.config?.entity?.filter?.type[0];
  const ancestor = ancestorsByType[filterType];
  const record = {
    [question.id]: ancestor.id,
  };
  const parentQuestionId = getParentQuestionId(question);
  if (!parentQuestionId) {
    return record;
  }
  const parentQuestion = questionsById[parentQuestionId];
  return {
    ...record,
    ...getPrimaryQuestionAncestorAnswers(parentQuestion, questionsById, ancestorsByType),
  };
};

export const getPrimaryEntityParentQuestionIds = (primaryEntityQuestion, questions) => {
  const parentQuestionId = getParentQuestionId(primaryEntityQuestion);
  if (!parentQuestionId) {
    return [];
  }
  const parentQuestion = questions.find(question => question.id === parentQuestionId);
  return [parentQuestionId, ...getPrimaryEntityParentQuestionIds(parentQuestion, questions)];
};
