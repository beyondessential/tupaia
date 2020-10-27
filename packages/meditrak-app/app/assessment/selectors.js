/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { checkAnswerPreconditionsAreMet } from './helpers';

export const getSurveyScreenIndex = state => state.assessment.currentScreenIndex;

export const getCurrentScreen = state => getSurveyScreen(state, getSurveyScreenIndex(state));

export const getSurveyScreen = (state, screenIndex) => getScreens(state)[screenIndex];

export const getScreens = state => state.assessment.screens || [];

export const getTotalNumberOfScreens = state => getScreens(state).length;

export const getEntityQuestionState = (state, questionId) =>
  state.entity.questions[questionId] || {};

export const getErrorMessageForScreen = (state, screenIndex) => {
  // If the screen index is past the end of the screens array, get the submit screen error
  if (screenIndex === getTotalNumberOfScreens(state)) {
    if (
      getScreens(state).some(screen =>
        screen.components.some(component => !!component.validationErrorMessage),
      )
    ) {
      return 'This survey contains validation errors on some answers, please go back through and fix them before submitting';
    }
    return '';
  }
  return getSurveyScreen(state, screenIndex).errorMessage;
};

const checkQuestionIsVisible = (answers, visibilityCriteria) => {
  const { hidden } = visibilityCriteria;
  return !hidden && checkAnswerPreconditionsAreMet(answers, visibilityCriteria);
};

export const getSurveyScreenQuestions = (state, screenIndex) => {
  // Build questions to display, filtering out follow up questions if enabling answer not given
  const questions = [];
  getSurveyScreen(state, screenIndex).components.forEach((component, index) => {
    const {
      questionId,
      visibilityCriteria,
      questionLabel,
      detailLabel,
      validationCriteria,
    } = component;

    const question = {
      id: questionId,
      ...getQuestion(state, questionId),
      componentIndex: index,
      visibilityCriteria,
      checkVisibility: answers => checkQuestionIsVisible(answers, visibilityCriteria),
      validationCriteria,
    };

    // If a question label has been defined on the component, override the default question text
    if (questionLabel) question.questionText = questionLabel;
    // If a detail label has been defined on the component, override the default label text
    if (detailLabel) question.detailText = detailLabel;

    questions.push(question);
  });

  return questions;
};

export const getValidQuestions = (state, questions, validatedScreens) => {
  const answers = getAnswers(state);
  const visibilityCriteriaByQuestion = validatedScreens.reduce((prev, curr) => {
    const components = {};
    curr.components.forEach(component => {
      components[component.questionId] = component.visibilityCriteria;
    });
    return { ...prev, ...components };
  }, {});

  return Object.values(questions).filter(question =>
    checkAnswerPreconditionsAreMet(answers, visibilityCriteriaByQuestion[question.id]),
  );
};

export const getSelectedCountryId = ({ country }) => country.selectedCountryId;

// Whether a given survey can repeat, i.e. be done again and again within a single facility on a
// single date. If no surveyId passed in, will assume the current survey being completed
export const getCanSurveyRepeat = ({ assessment }, surveyId = assessment.surveyId) =>
  assessment.surveys[surveyId] && assessment.surveys[surveyId].canRepeat;

// The name of a survey. If no surveyId passed in, will assume the current survey being completed
export const getSurveyName = ({ assessment }, surveyId = assessment.surveyId) =>
  assessment.surveys[surveyId].name;

export const getQuestionState = (state, screenIndex, componentIndex) => {
  const component = getSurveyScreen(state, screenIndex).components[componentIndex];
  return {
    ...component,
    answer: getAnswerForQuestion(state, component.questionId),
  };
};

export const getQuestion = (state, questionId) => state.assessment.questions[questionId];

export const getAnswers = state => state.assessment.answers;

export const getAnswerForQuestion = (state, questionId) => getAnswers(state)[questionId];
