import { SurveyScreenComponent } from '../../types';

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

export const formatSurveyScreenQuestions = (
  questions: SurveyScreenComponent[],
  screenNumber: number | string,
) => {
  const nonInstructionQuestions = questions.filter(
    question => question.questionType !== 'Instruction',
  );

  return questions.map(question => {
    const questionNumber = nonInstructionQuestions.findIndex(
      nonInstructionQuestion => question.questionId === nonInstructionQuestion.questionId,
    );
    if (questionNumber === -1) return question;
    return {
      ...question,
      questionNumber: `${screenNumber}${convertNumberToLetter(questionNumber)}.`,
    };
  });
};

export const getAllSurveyComponents = (surveyScreens?: SurveyScreenComponent[][]) => {
  return surveyScreens?.flat() ?? [];
};
