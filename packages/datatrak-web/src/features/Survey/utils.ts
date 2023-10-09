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

export const READ_ONLY_QUESTION_TYPES = ['Instruction', 'Condition', 'Arithmetic'];

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
