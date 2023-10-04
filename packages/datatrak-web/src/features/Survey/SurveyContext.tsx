/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { Dispatch, createContext, useContext, useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { BooleanExpressionParser } from '@tupaia/expression-parser';
import { SurveyParams, SurveyScreenComponent } from '../../types';
import { useSurveyScreenComponents } from '../../api/queries';
import { formatSurveyScreenQuestions, getAllSurveyComponents } from './utils';

type SurveyFormContextType = {
  startTime: string;
  formData: Record<string, any>;
  activeScreen: SurveyScreenComponent[];
  isLast: boolean;
  numberOfScreens: number;
  screenNumber: number | null;
  screenHeader?: string;
  displayQuestions: SurveyScreenComponent[];
  sideMenuOpen?: boolean;
  isReviewScreen?: boolean;
  surveyScreenComponents?: SurveyScreenComponent[][];
  visibleScreens?: SurveyScreenComponent[][];
  surveyStartTime?: string;
};

const defaultContext = {
  startTime: new Date().toISOString(),
  formData: {},
  activeScreen: [],
  isLast: false,
  numberOfScreens: 0,
  screenNumber: 1,
  screenHeader: '',
  displayQuestions: [],
  sideMenuOpen: false,
  surveyScreenComponents: [],
} as SurveyFormContextType;

const SurveyFormContext = createContext(defaultContext as SurveyFormContextType);

export enum ACTION_TYPES {
  SET_FORM_DATA = 'SET_FORM_DATA',
  TOGGLE_SIDE_MENU = 'TOGGLE_SIDE_MENU',
  RESET_FORM_DATA = 'RESET_FORM_DATA',
  SET_SURVEY_START_TIME = 'SET_SURVEY_START_TIME',
}

interface SurveyFormAction {
  type: ACTION_TYPES;
  payload?: Record<string, any> | string | null;
}

export const SurveyFormDispatchContext = createContext<Dispatch<SurveyFormAction> | null>(null);

export const surveyReducer = (
  state: SurveyFormContextType,
  action: SurveyFormAction,
): SurveyFormContextType => {
  switch (action.type) {
    case ACTION_TYPES.SET_FORM_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...(action.payload as Record<string, any>),
        },
      };
    case ACTION_TYPES.TOGGLE_SIDE_MENU:
      return {
        ...state,
        sideMenuOpen: !state.sideMenuOpen,
      };
    case ACTION_TYPES.RESET_FORM_DATA:
      return {
        ...state,
        formData: {},
      };
    case ACTION_TYPES.SET_SURVEY_START_TIME:
      return {
        ...state,
        surveyStartTime: action.payload as string,
      };
    default:
      return state;
  }
};

const getIsQuestionVisible = (question: SurveyScreenComponent, formData: Record<string, any>) => {
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

export const SurveyContext = ({ children }) => {
  const [state, dispatch] = useReducer(surveyReducer, defaultContext);
  const { surveyCode, ...params } = useParams<SurveyParams>();
  const screenNumber = params.screenNumber ? parseInt(params.screenNumber!, 10) : null;
  const { data: surveyScreenComponents } = useSurveyScreenComponents(surveyCode);

  const { formData } = state;

  // filter out screens that have no visible questions
  const visibleScreens = surveyScreenComponents
    ? surveyScreenComponents.filter(screen =>
        screen.some(question => getIsQuestionVisible(question, formData)),
      )
    : [];

  const numberOfScreens = visibleScreens.length;
  const isLast = screenNumber === numberOfScreens;
  const isReviewScreen = !screenNumber;
  const activeScreen = visibleScreens?.[screenNumber! - 1] || [];

  const flattenedScreenComponents = getAllSurveyComponents(surveyScreenComponents);

  const getIsDependentQuestion = (questionId: SurveyScreenComponent['questionId']) => {
    // if the question controls the visibility of another question, return true
    if (
      flattenedScreenComponents.some(component => {
        return (
          component?.visibilityCriteria &&
          Object.keys(component?.visibilityCriteria).includes(questionId)
        );
      })
    )
      return true;

    // if the question answer controls the result of a condition question, return true
    if (
      flattenedScreenComponents.some(component => {
        return (
          component?.config?.condition &&
          component?.config?.condition?.conditions &&
          Object.keys(component?.config?.condition?.conditions).includes(questionId)
        );
      })
    )
      return true;
  };

  const getDisplayQuestions = () => {
    // If the first question is an instruction, don't render it since we always just
    // show the text of first questions as the heading. Format the questions with a question number to display
    const visibleQuestions = (activeScreen?.length && activeScreen[0].questionType === 'Instruction'
      ? activeScreen.slice(1)
      : activeScreen
    )
      .filter(question => getIsQuestionVisible(question, formData))
      .map(question => {
        const { questionId } = question;
        if (getIsDependentQuestion(questionId)) {
          // if the question dictates the visibility of any other questions, we need to update the formData when the value changes so the visibility of other questions can be updated in real time
          return {
            ...question,
            updateFormDataOnChange: true,
          };
        }
        return question;
      });
    return formatSurveyScreenQuestions(visibleQuestions, screenNumber!);
  };

  const getScreenHeader = () => {
    if (activeScreen.length && activeScreen[0].questionText) {
      return activeScreen[0].questionText;
    }
    return '';
  };

  useEffect(() => {
    const updateStartTime = () => {
      dispatch({
        type: ACTION_TYPES.SET_SURVEY_START_TIME,
        payload: moment().toISOString(),
      });
    };
    // update the start time when a survey is started, so that it can be passed on when submitting the survey
    updateStartTime();
  }, [surveyCode]);

  const displayQuestions = getDisplayQuestions();
  const screenHeader = getScreenHeader();

  return (
    <SurveyFormContext.Provider
      value={{
        ...state,
        activeScreen,
        isLast,
        numberOfScreens,
        screenNumber,
        isReviewScreen,
        displayQuestions,
        surveyScreenComponents,
        screenHeader,
        visibleScreens,
      }}
    >
      <SurveyFormDispatchContext.Provider value={dispatch}>
        {children}
      </SurveyFormDispatchContext.Provider>
    </SurveyFormContext.Provider>
  );
};

export const useSurveyForm = () => {
  const surveyFormContext = useContext(SurveyFormContext);
  const { surveyScreenComponents, formData } = surveyFormContext;
  const flattenedScreenComponents = getAllSurveyComponents(surveyScreenComponents);
  const dispatch = useContext(SurveyFormDispatchContext)!;

  const toggleSideMenu = () => {
    dispatch({ type: ACTION_TYPES.TOGGLE_SIDE_MENU });
  };

  const updateConditionalQuestions = (updatedFormData: Record<string, any>) => {
    const conditionalQuestions = flattenedScreenComponents.filter(
      question => question.questionType === 'Condition',
    );
    if (!conditionalQuestions.length) return updatedFormData;
    const formDataCopy = { ...updatedFormData };
    const expressionParser = new BooleanExpressionParser();

    const getConditionIsMet = ({ formula, defaultValues = {} }) => {
      const values = {};
      const variables = expressionParser.getVariables(formula);

      variables.forEach(questionIdVariable => {
        const questionId = questionIdVariable.replace(/^\$/, ''); // Remove the first $ prefix
        const answer = formDataCopy[questionId];
        const defaultValue =
          defaultValues[questionId] !== undefined ? defaultValues[questionId] : 0; // 0 is the last resort
        const value = answer !== undefined ? answer : defaultValue;
        values[questionIdVariable] = value;
      });

      expressionParser.setAll(values);
      return expressionParser.evaluate(formula);
    };

    // loop through all conditional questions and update the formData with the result of the condition
    conditionalQuestions.forEach(question => {
      const { conditions } = question.config?.condition;
      const result = Object.keys(conditions).find(resultValue =>
        getConditionIsMet(conditions[resultValue]),
      );
      if (result) {
        const { questionId } = question;
        formDataCopy[questionId] = result;
      }
    });
    return formDataCopy;
  };

  // reset the value of any questions that are no longer visible, so that they don't get submitted with the form and skew the results
  const resetInvisibleQuestions = (newFormData: Record<string, any>) => {
    const updatedFormData = { ...formData, ...newFormData };
    flattenedScreenComponents.forEach(component => {
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

  const getUpdatedFormData = (newFormData: Record<string, any>) => {
    const resetInvisibleQuestionData = resetInvisibleQuestions(newFormData);
    const updatedConditionalQuestions = updateConditionalQuestions(resetInvisibleQuestionData);
    return updatedConditionalQuestions;
  };

  const setFormData = (newFormData: Record<string, any>) => {
    const updatedFormData = getUpdatedFormData(newFormData);
    dispatch({ type: ACTION_TYPES.SET_FORM_DATA, payload: updatedFormData });
  };

  const resetForm = () => {
    dispatch({ type: ACTION_TYPES.RESET_FORM_DATA });
  };

  const getAnswerByQuestionId = (questionId: string) => {
    return surveyFormContext.formData[questionId];
  };

  return {
    ...surveyFormContext,
    toggleSideMenu,
    setFormData,
    resetForm,
    getAnswerByQuestionId,
  };
};
