/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { QuestionType } from '@tupaia/types';
import { SurveyScreen } from '../../../types';

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
    screens?.filter(screenItem =>
      screenItem.surveyScreenComponents.some(
        component => component.type !== QuestionType.Instruction,
      ),
    ) ?? [];

  const screenNumber = surveyScreenComponents.some(
    component => component.type !== QuestionType.Instruction,
  )
    ? nonInstructionScreens.findIndex(nonInstructionScreen => nonInstructionScreen.id === id) + 1
    : null;

  return screenNumber;
};

export const getAllSurveyComponents = (surveyScreens?: SurveyScreen[]) => {
  return surveyScreens?.map(({ surveyScreenComponents }) => surveyScreenComponents)?.flat() ?? [];
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
