/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { BooleanExpressionParser, ExpressionParser } from '@tupaia/expression-parser';
import { DatatrakWebSurveyRequest, QuestionType } from '@tupaia/types';
import { SurveyScreenComponent } from '../../../types';
import { formatSurveyScreenQuestions } from '../utils';

type ConditionConfig = DatatrakWebSurveyRequest.ConditionConfig;
type ArithmeticConfig = DatatrakWebSurveyRequest.ArithmeticConfig;

export const getIsQuestionVisible = (
  question: SurveyScreenComponent,
  formData: Record<string, any>,
) => {
  if (!question.visibilityCriteria || !Object.keys(question.visibilityCriteria).length) return true;
  const { visibilityCriteria } = question;
  const { _conjunction = 'or', ...dependantQuestions } = visibilityCriteria;

  const operator = _conjunction === 'or' ? 'some' : 'every';

  return Object.entries(dependantQuestions)[operator](([questionId, validAnswers]) => {
    const answer = formData[questionId];
    if (answer === undefined) return false;
    return Array.isArray(validAnswers) ? validAnswers?.includes(answer) : validAnswers === answer;
  });
};

export const getIsDependentQuestion = (
  screenComponents?: SurveyScreenComponent[],
  questionId?: SurveyScreenComponent['questionId'],
) => {
  return screenComponents?.some(question => {
    const { visibilityCriteria, config } = question;
    // if the question controls the visibility of another question, return true
    if (visibilityCriteria && Object.keys(visibilityCriteria).includes(questionId!)) return true;
    if (config?.condition) {
      const { conditions } = config?.condition;
      // if the question is used in the formula of any other question, return true
      return Object.keys(conditions).some(answer => {
        // formula always has the questionId + $ in front of it, so we can just check if the formula includes the questionId
        const { formula } = conditions[answer];
        return formula.includes(questionId!);
      });
    }
    if (config?.arithmetic) {
      const { formula } = config?.arithmetic;
      return formula.includes(questionId!);
    }
    return false;
  });
};

export const getDisplayQuestions = (
  activeScreen: SurveyScreenComponent[] = [],
  screenComponents: SurveyScreenComponent[],
  screenNumber?: number | null,
) => {
  // If the first question is an instruction, don't render it since we always just
  // show the text of first questions as the heading. Format the questions with a question number to display
  const displayQuestions = (activeScreen?.length && activeScreen?.[0].type === 'Instruction'
    ? activeScreen?.slice(1)
    : activeScreen
  ).map(question => {
    const { questionId } = question;
    if (getIsDependentQuestion(screenComponents, questionId)) {
      // if the question dictates the visibility of any other questions, we need to update the formData when the value changes so the visibility of other questions can be updated in real time
      return {
        ...question,
        updateFormDataOnChange: true,
      };
    }
    return question;
  });
  return formatSurveyScreenQuestions(displayQuestions, screenNumber!);
};

const getConditionIsMet = (expressionParser, formData, { formula, defaultValues = {} }) => {
  const values = {};
  const variables = expressionParser.getVariables(formula);

  variables.forEach(questionIdVariable => {
    const questionId = questionIdVariable.replace(/^\$/, ''); // Remove the first $ prefix
    const answer = formData[questionId];
    const defaultValue = defaultValues[questionId] !== undefined ? defaultValues[questionId] : 0; // 0 is the last resort
    const value = answer !== undefined ? answer : defaultValue;
    values[questionIdVariable] = value;
  });

  expressionParser.setAll(values);
  return expressionParser.evaluate(formula);
};

const getArithmeticDependantAnswer = (questionId, answer, valueTranslation, defaultValues) => {
  if (valueTranslation[questionId] && valueTranslation[questionId][answer] !== undefined) {
    return valueTranslation[questionId][answer]; // return translated answer if there's any
  }
  if (answer !== undefined) {
    return answer; // return raw answer
  }

  return defaultValues[questionId] !== undefined ? defaultValues[questionId] : 0; // No answer found, return the default answer
};

const getArithmeticResult = (
  expressionParser,
  formData,
  { formula, defaultValues = {}, valueTranslation = {} },
) => {
  const values = {};

  const variables = expressionParser.getVariables(formula);

  // Setting up scope values.
  const questionIds = variables.map(v => v.replace(/^\$/, ''));
  questionIds.forEach(questionId => {
    values[`$${questionId}`] = getArithmeticDependantAnswer(
      questionId,
      formData[questionId],
      valueTranslation,
      defaultValues,
    ); // scope variables need $ prefix to match the variables in expressions
  });

  // Evaluate the expression
  expressionParser.setAll(values);
  const result = !isNaN(expressionParser.evaluate(formula))
    ? Math.round(expressionParser.evaluate(formula) * 1000) / 1000 // Round to 3 decimal places
    : 0;

  return result;
};

const resetInvisibleQuestions = (
  oldFormData: Record<string, any>,
  updates: Record<string, any>,
  screenComponents: SurveyScreenComponent[],
) => {
  const updatedFormData = { ...oldFormData, ...updates };
  screenComponents?.forEach(component => {
    const { questionId, visibilityCriteria } = component;
    if (
      visibilityCriteria &&
      !getIsQuestionVisible(component, updatedFormData) &&
      updatedFormData.hasOwnProperty(questionId)
    ) {
      delete updatedFormData[questionId];
    }
  });

  return updatedFormData;
};

const updateDependentQuestions = (
  formData: Record<string, any>,
  screenComponents?: SurveyScreenComponent[],
) => {
  const formDataCopy = { ...formData };
  const expressionParser = new ExpressionParser();
  const booleanExpressionParser = new BooleanExpressionParser();

  screenComponents?.forEach(question => {
    const { config, type, questionId } = question;
    if (type === QuestionType.Condition) {
      const { conditions } = config?.condition as ConditionConfig;
      const result = Object.keys(conditions).find(resultValue =>
        getConditionIsMet(booleanExpressionParser, formDataCopy, conditions[resultValue]),
      );
      if (result) {
        formDataCopy[questionId] = result;
      }
    }
    if (type === QuestionType.Arithmetic) {
      const result = getArithmeticResult(
        expressionParser,
        formDataCopy,
        config?.arithmetic as ArithmeticConfig,
      );
      if (result) {
        formDataCopy[questionId] = result;
      }
    }
  });

  return formDataCopy;
};

export const getUpdatedFormData = (
  updates: Record<string, any>,
  formData: Record<string, any>,
  screenComponents: SurveyScreenComponent[],
) => {
  // reset the values of invisible questions first, in case the value of the invisible question is used in the formula of another question
  const resetInvisibleQuestionData = resetInvisibleQuestions(formData, updates, screenComponents);
  return updateDependentQuestions(resetInvisibleQuestionData, screenComponents);
};
