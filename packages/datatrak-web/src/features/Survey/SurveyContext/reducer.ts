import { SurveyScreen, SurveyScreenComponent } from '../../../types';
import { ACTION_TYPES, SurveyFormAction } from './actions';

export interface SurveyFormContextType {
  activeScreen: SurveyScreenComponent[];
  cancelModalConfirmLink: string;
  cancelModalOpen: boolean;
  countryCode: string | undefined;
  displayQuestions: SurveyScreenComponent[];
  formData: Record<string, any>;
  isLast: boolean;
  isResponseScreen: boolean;
  isResubmit: boolean;
  isReviewScreen: boolean;
  isSuccessScreen?: boolean;
  numberOfScreens: number;
  primaryEntityQuestion?: SurveyScreenComponent | null;
  screenDetail?: string | null;
  screenHeader?: string;
  screenNumber: number | null;
  sideMenuOpen?: boolean;
  startTime: string;
  surveyCode?: string;
  surveyProjectCode?: string;
  surveyScreens?: SurveyScreen[];
  surveyStartTime?: string;
  visibleScreens?: SurveyScreen[];
}

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
        cancelModalConfirmLink: action.payload as string,
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
