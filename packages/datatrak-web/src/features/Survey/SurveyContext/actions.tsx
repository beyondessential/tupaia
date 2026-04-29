export enum ACTION_TYPES {
  SET_FORM_DATA = 'SET_FORM_DATA',
  TOGGLE_SIDE_MENU = 'TOGGLE_SIDE_MENU',
  RESET_FORM_DATA = 'RESET_FORM_DATA',
  SET_SURVEY_START_TIME = 'SET_SURVEY_START_TIME',
}

export interface SurveyFormAction {
  type: ACTION_TYPES;
  payload?: Record<string, any> | string | number | null;
}
