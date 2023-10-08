/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Dispatch, createContext } from 'react';
import { SurveyScreenComponent, SurveyScreen } from '../../../types';
import { ACTION_TYPES, SurveyFormAction } from './actions';

export type SurveyFormContextType = {
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
  surveyScreens?: SurveyScreen[];
  visibleScreens?: SurveyScreen[];
  surveyStartTime?: string;
};

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
