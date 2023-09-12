/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { Dispatch, createContext, useContext, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import { sortBy } from 'lodash';
import { SurveyParams, SurveyScreenComponent } from '../../types';
import { useSurveyScreenComponents } from '../../api/queries';

const convertNumberToLetter = (number: number) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  if (number > 25) {
    // occasionally there are more than 26 questions on a screen, so we then start at aa, ab....
    const firstLetter = alphabet[Math.floor(number / 26) - 1];
    const secondLetter = alphabet[number % 26];
    return `${firstLetter}${secondLetter}`;
  }
  return alphabet[number];
};

type SurveyFormContextType = {
  formData: Record<string, any>;
  activeScreen: SurveyScreenComponent[];
  isLast: boolean;
  numberOfScreens: number;
  screenNumber: number | null;
  screenHeader?: string;
  displayQuestions: SurveyScreenComponent[];
  sideMenuOpen?: boolean;
  surveyScreenComponents?: Record<number, SurveyScreenComponent[]>;
};

const defaultContext = {
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
}

interface SurveyFormAction {
  type: ACTION_TYPES;
  payload?: Record<string, any> | null;
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
    default:
      return state;
  }
};

export const SurveyContext = ({ children }) => {
  const [state, dispatch] = useReducer(surveyReducer, defaultContext);

  const { surveyCode, ...params } = useParams<SurveyParams>();
  const screenNumber = params.screenNumber ? parseInt(params.screenNumber!, 10) : null;
  const { data: surveyScreenComponents } = useSurveyScreenComponents(surveyCode);

  const activeScreen = sortBy(surveyScreenComponents[screenNumber!], 'componentNumber');
  const numberOfScreens = Object.keys(surveyScreenComponents).length;
  const isLast = screenNumber === numberOfScreens;

  const nonInstructionQuestions = activeScreen.filter(
    question => question.questionType !== 'Instruction',
  );

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
  const displayQuestions = (activeScreen.length && activeScreen[0].questionType === 'Instruction'
    ? activeScreen.slice(1)
    : activeScreen
  ).map(question => {
    const questionNumber = nonInstructionQuestions.findIndex(
      nonInstructionQuestion => question.questionId === nonInstructionQuestion.questionId,
    );
    if (questionNumber === -1) return question;
    return {
      ...question,
      questionNumber: `${screenNumberToDisplay}${convertNumberToLetter(questionNumber)}.`,
    };
  });

  return (
    <SurveyFormContext.Provider
      value={{
        ...state,
        activeScreen,
        isLast,
        numberOfScreens,
        screenNumber,
        displayQuestions,
        surveyScreenComponents,
        screenHeader: activeScreen.length ? activeScreen[0].questionText : '',
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
  return {
    ...surveyFormContext,
    toggleSideMenu,
    setFormData,
    resetForm,
  };
};
