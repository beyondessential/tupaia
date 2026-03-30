import { BooleanExpressionParser, ExpressionParser } from '@tupaia/expression-parser';
import {
  ArithmeticQuestionConfig,
  CodeGeneratorQuestionConfig,
  ConditionQuestionConfig,
  QuestionType,
} from '@tupaia/types';
import { SurveyScreenComponent } from '../../../types';
import { generateMongoId, generateShortId } from './generateId';
import { stripTimezoneFromDate } from '@tupaia/utils';

export const getIsQuestionVisible = (
  question: SurveyScreenComponent,
  formData: Record<string, any>,
) => {
  if (!question.visibilityCriteria || !Object.keys(question.visibilityCriteria).length) return true;
  const { visibilityCriteria } = question;
  const { _conjunction = 'or', hidden, ...dependantQuestions } = visibilityCriteria;

  if (hidden) return false;
  const operator = _conjunction === 'or' ? 'some' : 'every';

  return Object.entries(dependantQuestions)[operator](([questionId, validAnswers]) => {
    const answer = formData[questionId];
    if (answer === undefined) return false;

    // stringify the answer to compare with the validAnswers so that the types are always the same
    const stringifiedAnswer = String(answer);
    return Array.isArray(validAnswers)
      ? validAnswers?.map(validAnswer => String(validAnswer)).includes(stringifiedAnswer)
      : String(validAnswers) === stringifiedAnswer;
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
) => {
  // If the first question is an instruction, don't render it since we always just
  // show the text of first questions as the heading. Format the questions with a question number to display
  const displayQuestions = (
    activeScreen?.length && activeScreen?.[0].type === 'Instruction'
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
  return displayQuestions;
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
  // return raw answer if it's a number, else 0 (e.g. if no valueTranslation provided for the question and this specific answer when answer is non-numeric)
  if (answer !== undefined && answer !== null && answer !== '') {
    return isNaN(answer) ? 0 : answer; // return raw answer
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
    values[`$${questionId}`] = Number(
      getArithmeticDependantAnswer(
        questionId,
        formData[questionId],
        valueTranslation,
        defaultValues,
      ),
    ); // scope variables need $ prefix to match the variables in expressions
  });

  // Evaluate the expression
  expressionParser.setAll(values);

  const result = !isNaN(expressionParser.evaluate(formula))
    ? Math.round(expressionParser.evaluate(formula) * 1000) / 1000 // Round to 3 decimal places
    : 0;

  return result;
};

const resetInvisibleAndFilteredQuestions = (
  oldFormData: Record<string, any>,
  updates: Record<string, any>,
  screenComponents: SurveyScreenComponent[],
) => {
  const updatedFormData = { ...oldFormData, ...updates };
  screenComponents?.forEach(component => {
    const { questionId, visibilityCriteria, type } = component;

    // if the question is not visible and is not set to always be hidden and has a value, reset the value
    if (
      visibilityCriteria &&
      !visibilityCriteria.hidden &&
      !getIsQuestionVisible(component, updatedFormData) &&
      updatedFormData.hasOwnProperty(questionId)
    ) {
      updatedFormData[questionId] = undefined;
    }
    if (
      // if the question is an entity question and the value has changed, reset the value of all entity questions that depend on this question
      (type === QuestionType.Entity || type === QuestionType.PrimaryEntity) &&
      updatedFormData.hasOwnProperty(questionId) &&
      updatedFormData[questionId] !== oldFormData[questionId]
    ) {
      // get all entity questions that depend on this question
      const entityQuestionsFilteredByValue = screenComponents.filter(question => {
        if (!question.config?.entity) return false;
        const { entity } = question.config;
        if (entity.filter) {
          const { filter } = entity;
          return Object.values(filter).some(filterValue => {
            if (typeof filterValue === 'object' && 'questionId' in filterValue) {
              return filterValue.questionId === questionId;
            }
            return false;
          });
        }
        return false;
      });

      // reset the value of all entity questions that depend on this question
      entityQuestionsFilteredByValue.forEach(entityQuestion => {
        const { questionId: entityQuestionId } = entityQuestion;
        updatedFormData[entityQuestionId] = undefined;
      });
    }
  });

  return updatedFormData;
};

const hasConditionConfig = (
  ssc: SurveyScreenComponent,
): ssc is SurveyScreenComponent & {
  config: { condition: ConditionQuestionConfig };
} => ssc.type === QuestionType.Condition && ssc.config?.condition !== undefined;

const hasArithmeticConfig = (
  ssc: SurveyScreenComponent,
): ssc is SurveyScreenComponent & {
  config: { arithmetic: ArithmeticQuestionConfig };
} => ssc.type === QuestionType.Arithmetic && ssc.config?.arithmetic !== undefined;

const hasCodeGeneratorConfig = (
  ssc: SurveyScreenComponent,
): ssc is SurveyScreenComponent & {
  config: { codeGenerator: CodeGeneratorQuestionConfig };
} => ssc.type === QuestionType.CodeGenerator && ssc.config?.codeGenerator !== undefined;

const updateDependentQuestions = (
  formData: Record<string, any>,
  screenComponents?: SurveyScreenComponent[],
) => {
  const formDataCopy = { ...formData };
  const expressionParser = new ExpressionParser();
  const booleanExpressionParser = new BooleanExpressionParser();

  screenComponents?.forEach(question => {
    if (!question.config) return;
    const { questionId } = question;
    if (hasConditionConfig(question)) {
      const { conditions } = question.config.condition;
      const result = Object.keys(conditions).find(resultValue =>
        getConditionIsMet(booleanExpressionParser, formDataCopy, conditions[resultValue]),
      );
      if (result !== undefined && result !== null) {
        formDataCopy[questionId] = result;
      }
    }
    if (hasArithmeticConfig(question)) {
      const { arithmetic } = question.config;
      const result = getArithmeticResult(expressionParser, formDataCopy, arithmetic);
      if (result !== undefined && result !== null) {
        formDataCopy[questionId] = result;
      }
    }
  });

  return formDataCopy;
};

const generateCodeAnswer = (question: SurveyScreenComponent, formData: Record<string, any>) => {
  const { config, questionId } = question;
  const { codeGenerator } = config as {
    codeGenerator: CodeGeneratorQuestionConfig;
  };
  if (hasCodeGeneratorConfig(question) && !formData[questionId]) {
    return codeGenerator.type === 'shortid' ? generateShortId(codeGenerator) : generateMongoId();
  }
  return formData[questionId];
};

export const generateCodeForCodeGeneratorQuestions = (
  screenComponents: SurveyScreenComponent[],
  formData: Record<string, any>,
) => {
  const formDataCopy = { ...formData };
  screenComponents?.forEach(question => {
    if (!question.config) return;
    const { questionId } = question;
    formDataCopy[questionId] = generateCodeAnswer(question, formDataCopy);
  });
  return formDataCopy;
};

/**
 * @description Remove timezone from date answers so that the date is displayed correctly in the UI no matter the timezone. On submission these will be added back.
 */
const removeTimezoneFromDateAnswers = (updates, screenComponents: SurveyScreenComponent[]) => {
  const updatedAnswers = { ...updates };
  screenComponents?.forEach(question => {
    const { questionId, type } = question;
    if (type.includes(QuestionType.Date) && updates[questionId]) {
      updatedAnswers[questionId] = stripTimezoneFromDate(updates[questionId]);
    }
  });
  return updatedAnswers;
};

export const getUpdatedFormData = (
  updates: Record<string, any>,
  formData: Record<string, any>,
  screenComponents: SurveyScreenComponent[],
) => {
  const updatedValues = removeTimezoneFromDateAnswers(updates, screenComponents);

  // reset the values of invisible questions first, in case the value of the invisible question is used in the formula of another question. Also reset the value of filtered entity questions
  const resetQuestionData = resetInvisibleAndFilteredQuestions(
    formData,
    updatedValues,
    screenComponents,
  );
  return updateDependentQuestions(resetQuestionData, screenComponents);
};

export const getArithmeticDisplayAnswer = (config, answer, formData) => {
  const expressionParser = new ExpressionParser();
  const {
    formula,
    valueTranslation = {},
    defaultValues = {},
    answerDisplayText = '',
  } = config?.arithmetic as ArithmeticQuestionConfig;
  if (!answerDisplayText) return answer;
  const variables = expressionParser.getVariables(formula);

  // Setting up scope values.
  const questionIds = variables.map(v => v.replace(/^\$/, ''));
  let translatedDisplayAnswer = answerDisplayText;
  questionIds.forEach(questionId => {
    const answerValue = getArithmeticDependantAnswer(
      questionId,
      formData[questionId],
      valueTranslation,
      defaultValues,
    );
    translatedDisplayAnswer = translatedDisplayAnswer.replace(`$${questionId}`, answerValue);
  });
  translatedDisplayAnswer = translatedDisplayAnswer.replace('$result', answer);
  return translatedDisplayAnswer;
};
