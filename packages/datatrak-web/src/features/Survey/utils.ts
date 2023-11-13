/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { QuestionType } from '@tupaia/types';
import { SurveyScreenComponent, SurveyScreen } from '../../types';

export const convertNumberToLetter = (number: number) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  if (number > 25) {
    // occasionally there are more than 26 questions on a screen, so we then start at aa, ab....
    const firstLetter = alphabet[Math.floor(number / 26) - 1];
    const secondLetter = alphabet[number % 26];
    return `${firstLetter}${secondLetter}`;
  }
  return alphabet[number];
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

export const formatSurveyScreenQuestions = (
  questions: SurveyScreenComponent[],
  screenNumber: number | string,
) => {
  const nonReadOnlyQuestions = questions.filter(
    question => !READ_ONLY_QUESTION_TYPES.includes(question?.type!),
  );

  return questions.map(question => {
    const questionNumber = nonReadOnlyQuestions.findIndex(
      nonInstructionQuestion => question.questionId === nonInstructionQuestion.questionId,
    );
    if (questionNumber === -1) return question;
    return {
      ...question,
      questionNumber: `${screenNumber}${convertNumberToLetter(questionNumber)}.`,
    };
  });
};

export const getAllSurveyComponents = (surveyScreens?: SurveyScreen[]) => {
  return surveyScreens?.reduce((components, screen) => {
    return [...components, ...screen.surveyScreenComponents];
  }, [] as SurveyScreenComponent[]);
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
