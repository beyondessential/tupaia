import { ControllerRenderProps } from 'react-hook-form';
import { DatatrakWebSurveyRequest } from '@tupaia/types';

export type Survey = DatatrakWebSurveyRequest.ResBody;
export type SurveyScreen = DatatrakWebSurveyRequest.SurveyScreen;

export interface SurveyScreenComponent extends DatatrakWebSurveyRequest.SurveyScreenComponent {
  updateFormDataOnChange?: boolean;
}

export type SurveyParams = {
  projectCode: string;
  countryCode: string;
  entityCode: string;
  surveyCode: string;
  screenNumber: string;
};

export interface SurveyQuestionFieldProps
  extends Omit<SurveyScreenComponent, 'componentNumber' | 'questionId' | 'updatedAtSyncTick'> {
  name: SurveyScreenComponent['code'];
  id: SurveyScreenComponent['questionId'];
}

export interface SurveyQuestionInputProps
  extends Omit<SurveyQuestionFieldProps, 'type' | 'text' | 'updatedAtSyncTick'> {
  controllerProps: ControllerRenderProps & {
    invalid?: boolean;
  };
  required?: boolean;
  min?: number;
  max?: number;
  type?: SurveyQuestionFieldProps['type'];
  text?: SurveyQuestionFieldProps['text'];
}
