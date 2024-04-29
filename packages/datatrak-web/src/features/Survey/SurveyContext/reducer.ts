/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SurveyScreenComponent, SurveyScreen } from '../../../types';
import { ACTION_TYPES, SurveyFormAction } from './actions';

export type SurveyFormContextType = {
  startTime: string;
  surveyCode?: string;
  surveyProjectCode?: string;
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
  isSuccessScreen?: boolean;
  cancelModalOpen: boolean;
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
    case ACTION_TYPES.OPEN_CANCEL_CONFIRMATION:
      return {
        ...state,
        cancelModalOpen: true,
      };
    case ACTION_TYPES.CLOSE_CANCEL_CONFIRMATION:
      return {
        ...state,
        cancelModalOpen: false,
      };
    default:
      return state;
  }
};
