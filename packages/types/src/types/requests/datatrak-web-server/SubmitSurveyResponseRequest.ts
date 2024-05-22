/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { UserAccount, Survey, Entity } from '../../models';
import { SurveyScreenComponent } from './SurveyRequest';

export type FileUploadAnswer = {
  name: string;
  value: string;
};

export type Answer = string | number | boolean | null | undefined | FileUploadAnswer;

export type Answers = Record<string, Answer>;

interface SurveyResponse {
  userId: UserAccount['id'] | null;
  surveyId: Survey['id'];
  countryId: Entity['id'];
  questions: SurveyScreenComponent[];
  answers: Answers;
  startTime: string;
  timezone: string;
}

export type Params = Record<string, never>;
export type ResBody = {
  qrCodeEntitiesCreated: Entity[];
};
export type ReqBody = SurveyResponse;
export type ReqQuery = Record<string, never>;
