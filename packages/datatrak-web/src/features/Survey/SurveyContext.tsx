/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { Dispatch, createContext, useContext, useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { SurveyParams, SurveyScreenComponent } from '../../types';
import { useSurveyScreenComponents } from '../../api/queries';
import { formatSurveyScreenQuestions } from './utils';

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
  surveyScreenComponents?: Record<number, SurveyScreenComponent[]>;
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
  SET_ANSWER = 'SET_ANSWER',
}

type SingleAnswerPayload = {
  questionId: string;
  answer: any;
};
interface SurveyFormAction {
  type: ACTION_TYPES;
  payload?: Record<string, any> | string | null | SingleAnswerPayload;
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
    case ACTION_TYPES.SET_ANSWER:
      return {
        ...state,
        formData: {
          ...state.formData,
          [(action.payload as SingleAnswerPayload)
            ?.questionId]: (action.payload as SingleAnswerPayload)?.answer,
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
    return validAnswers.includes(answer);
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
    ? Object.values(surveyScreenComponents).filter(screen =>
        screen?.some(question => getIsQuestionVisible(question, formData)),
      )
    : [];

  const numberOfScreens = visibleScreens.length;
  const isLast = screenNumber === numberOfScreens;
  const isReviewScreen = !screenNumber;
  const activeScreen = visibleScreens?.[screenNumber! - 1] || [];

  const getDisplayQuestions = () => {
    const flattenedScreenComponents = surveyScreenComponents
      ? Object.values(surveyScreenComponents).flat()
      : [];
    // If the first question is an instruction, don't render it since we always just
    // show the text of first questions as the heading. Format the questions with a question number to display
    const visibleQuestions = (activeScreen?.length && activeScreen[0].questionType === 'Instruction'
      ? activeScreen.slice(1)
      : activeScreen
    )
      .filter(question => getIsQuestionVisible(question, formData))
      .map(question => {
        const { questionId } = question;
        if (
          flattenedScreenComponents.some(component => {
            return (
              component?.visibilityCriteria &&
              Object.keys(component?.visibilityCriteria).includes(questionId)
            );
          })
        ) {
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
  const dispatch = useContext(SurveyFormDispatchContext)!;

  const toggleSideMenu = () => {
    dispatch({ type: ACTION_TYPES.TOGGLE_SIDE_MENU });
  };

  const setFormData = (formData: Record<string, any>) => {
    dispatch({ type: ACTION_TYPES.SET_FORM_DATA, payload: formData });
  };

  const resetForm = () => {
    dispatch({ type: ACTION_TYPES.RESET_FORM_DATA });
  };

  const setSingleAnswer = (questionId: string, answer: any) => {
    dispatch({ type: ACTION_TYPES.SET_ANSWER, payload: { questionId, answer } });
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
    setSingleAnswer,
  };
};
