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
  surveyStartTime?: Moment;
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
        surveyStartTime: action.payload as Moment,
      };
    default:
      return state;
  }
};

export const SurveyContext = ({ children }) => {
  const [state, dispatch] = useReducer(surveyReducer, defaultContext);

  const { surveyCode, ...params } = useParams<SurveyParams>();
  const screenNumber = params.screenNumber ? parseInt(params.screenNumber!, 10) : null;
  const { data: surveyScreenComponents } = useSurveyScreenComponents(surveyCode);

  const activeScreen = surveyScreenComponents[screenNumber!] ?? [];
  const numberOfScreens = Object.keys(surveyScreenComponents).length;
  const isLast = screenNumber === numberOfScreens;

  // for the purposes of displaying the screen number, we don't want to count screens that only have instructions
  const screensWithQuestions = Object.values(surveyScreenComponents).filter(screen => {
    const nonInstructionQuestions = screen.filter(
      question => question.questionType !== 'Instruction',
    );
    return nonInstructionQuestions.length > 0;
  });

  const screenNumberToDisplay = activeScreen?.length
    ? screensWithQuestions.findIndex(
        screen => screen[0].questionId === activeScreen[0].questionId,
      ) + 1
    : -1;
  // If the first question is an instruction, don't render it since we always just
  // show the text of first questions as the heading. Format the questions with a question number to display
  const displayQuestions = formatSurveyScreenQuestions(
    activeScreen.length && activeScreen[0].questionType === 'Instruction'
      ? activeScreen.slice(1)
      : activeScreen,
    screenNumberToDisplay,
  );

  const isReviewScreen = !screenNumber;
  let screenHeader = '';
  if (activeScreen.length && activeScreen[0].questionText) {
    screenHeader = activeScreen[0].questionText;
  }

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
