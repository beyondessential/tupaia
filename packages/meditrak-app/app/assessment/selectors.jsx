import { ExpressionParser, BooleanExpressionParser } from '@tupaia/expression-parser';
import { checkAnswerPreconditionsAreMet } from './helpers';

const expressionParser = new ExpressionParser();
const booleanExpressionParser = new BooleanExpressionParser();

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
    const { questionId, visibilityCriteria, questionLabel, detailLabel, validationCriteria } =
      component;

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

export const getArithmeticResult = (state, arithmeticQuestionId) => {
  const { config } = getQuestion(state, arithmeticQuestionId);

  const {
    arithmetic: { formula, valueTranslation = {}, defaultValues = {}, answerDisplayText = '' },
  } = config;

  const values = {};

  const variables = expressionParser.getVariables(formula);
  const getArithmeticAnswer = questionId => {
    const answer = getAnswerForQuestion(state, questionId);

    if (valueTranslation[questionId] && valueTranslation[questionId][answer] !== undefined) {
      return valueTranslation[questionId][answer]; // return translated answer if there's any
    }
    // return raw answer if it's a number, else 0 (e.g. if no valueTranslation provided for the question and this specific answer when answer is non-numeric)
    if (answer !== undefined && answer !== null && answer !== '') {
      return isNaN(answer) ? 0 : answer; // return raw answer
    }

    // return default answer if there's no answer
    return defaultValues[questionId] !== undefined ? defaultValues[questionId] : 0; // No answer found, return the default answer
  };

  // Setting up scope values.
  const questionIds = variables.map(v => v.replace(/^\$/, ''));
  questionIds.forEach(questionId => {
    values[`$${questionId}`] = getArithmeticAnswer(questionId); // scope variables need $ prefix to match the variables in expressions
  });

  // Evaluate the expression
  expressionParser.setAll(values);
  const result = !isNaN(expressionParser.evaluate(formula))
    ? Math.round(expressionParser.evaluate(formula) * 1000) / 1000 // Round to 3 decimal places
    : 0;
  expressionParser.clearScope();
  // Replace variables with actual values in answerDisplayText
  let translatedAnswerDisplayText = answerDisplayText;
  questionIds.forEach(questionId => {
    const answer = values[`$${questionId}`];
    translatedAnswerDisplayText = translatedAnswerDisplayText.replace(questionId, answer);
  });
  translatedAnswerDisplayText = translatedAnswerDisplayText.replace('$result', result);

  return {
    answerDisplayText: translatedAnswerDisplayText,
    result,
  };
};

export const getConditionResult = (state, conditionQuestionId) => {
  const { config } = getQuestion(state, conditionQuestionId);
  const {
    condition: { conditions },
  } = config;
  const checkConditionMet = ({ formula, defaultValues = {} }) => {
    const values = {};
    const variables = booleanExpressionParser.getVariables(formula);

    variables.forEach(questionIdVariable => {
      const questionId = questionIdVariable.replace(/^\$/, ''); // Remove the first $ prefix
      const answer = getAnswerForQuestion(state, questionId);
      const defaultValue = defaultValues[questionId] !== undefined ? defaultValues[questionId] : 0; // 0 is the last resort
      const value = answer !== undefined ? answer : defaultValue;
      values[questionIdVariable] = value;
    });

    booleanExpressionParser.setAll(values);
    const result = booleanExpressionParser.evaluate(formula);
    booleanExpressionParser.clearScope();
    return result;
  };

  const result = Object.keys(conditions).find(resultValue =>
    checkConditionMet(conditions[resultValue]),
  );

  return {
    result,
  };
};
