/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';

import {
  ANSWER_CHANGE,
  ASSESSMENT_RESET,
  EXTRA_PROPS_CHANGE,
  SURVEY_SCREEN_ERROR_MESSAGE_CHANGE,
  SURVEY_SCREEN_SELECT,
  SURVEY_SELECT,
  SURVEY_SUBMIT_SUCCESS,
  SURVEY_SUBMIT,
  UPDATE_SURVEYS,
  VALIDATION_ERROR_CHANGE,
  WIPE_CURRENT_SURVEY,
  SCROLL_CONTROL_ATTACH,
  SCROLL_CONTROL_RELEASE,
} from './constants';

const defaultState = {
  currentScreenIndex: -1,
  screens: null,
  isSubmitting: false,
  isSurveyInProgress: false,
  questions: {},
  answers: {},
  isChildScrolling: false, // question controlling scroll as opposed to DumbSurveyScreen
};

// Have to be careful with objects in default state, must deep copy when using them. State should
// not be mutated. This utility function makes it easy to update a specific component, and deep
// clone along the way, to avoid mutating objects
const updateComponentState = (state, screenIndex, componentIndex, updateComponent) => {
  const screens = [...state.screens];
  const components = [...screens[screenIndex].components];
  const component = updateComponent({ ...components[componentIndex] });
  components[componentIndex] = component;
  screens[screenIndex].components = components;
  return { screens };
};

const stateChanges = {
  [ANSWER_CHANGE]: ({ questionId, newAnswer }, state) => {
    const answers = { ...state.answers };
    answers[questionId] = newAnswer;
    return { answers };
  },
  [VALIDATION_ERROR_CHANGE]: ({ screenIndex, componentIndex, validationErrorMessage }, state) =>
    updateComponentState(state, screenIndex, componentIndex, component => {
      if (component.hasOwnProperty('validationErrorMessage') || validationErrorMessage) {
        return { ...component, validationErrorMessage };
      }
      return component;
    }),
  [EXTRA_PROPS_CHANGE]: ({ componentIndex, newProps }, state) =>
    updateComponentState(state, state.currentScreenIndex, componentIndex, component => {
      return { ...component, extraProps: { ...component.extraProps, ...newProps } };
    }),
  [ASSESSMENT_RESET]: () => defaultState,
  [SURVEY_SCREEN_ERROR_MESSAGE_CHANGE]: ({ message, screenIndex }, state) => {
    const screens = [...state.screens];
    screens[screenIndex].errorMessage = message;
    return { screens };
  },
  [SURVEY_SELECT]: ({ answers, assessorId, surveyId, screens, startTime, questions }) => ({
    answers,
    assessorId,
    surveyId,
    screens,
    questions,
    startTime,
    isSubmitting: false,
    isSurveyInProgress: true,
    currentScreenIndex: 0, // Start at the first screen
  }),
  [SURVEY_SCREEN_SELECT]: ({ screenIndex }) => ({
    currentScreenIndex: screenIndex,
  }),
  [SURVEY_SUBMIT]: () => ({ isSubmitting: true }),
  [SURVEY_SUBMIT_SUCCESS]: () => ({
    isSubmitting: false,
    isSurveyInProgress: false,
  }),
  [UPDATE_SURVEYS]: ({ surveys }) => ({ surveys }),
  [WIPE_CURRENT_SURVEY]: () => ({
    answers: defaultState.answers,
    questions: defaultState.questions,
    screens: defaultState.screens,
    currentScreenIndex: defaultState.currentScreenIndex,
    isSurveyInProgress: false,
  }),
  [SCROLL_CONTROL_ATTACH]: () => ({ isChildScrolling: true }),
  [SCROLL_CONTROL_RELEASE]: () => ({ isChildScrolling: false }),
};

const onRehydrate = incomingState => {
  if (!incomingState) return undefined;

  const assessmentState = incomingState.assessment;
  if (!assessmentState) return undefined;

  // Ensure state never gets stuck in loading loop.
  assessmentState.isSubmitting = false;

  return assessmentState;
};

export const reducer = createReducer(defaultState, stateChanges, onRehydrate);
