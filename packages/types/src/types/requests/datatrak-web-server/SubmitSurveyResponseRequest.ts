import { UserAccount, Survey, Entity } from '../../models';
import { SurveyScreenComponent } from './SurveyRequest';

export type FileUploadAnswer = {
  name: string;
  value: string;
};

export type UserAnswer = {
  id: string;
  name: string;
};

export type Answer = string | number | boolean | null | undefined | FileUploadAnswer | UserAnswer;

export type Answers = Record<string, Answer>;

interface SurveyResponse {
  userId: UserAccount['id'] | null;
  surveyId: Survey['id'];
  countryId: Entity['id'];
  entityId?: Entity['id'];
  questions: Omit<SurveyScreenComponent, 'updatedAtSyncTick'>[];
  answers: Answers;
  startTime: string;
  timezone: string;
  dataTime?: string;
}

export type Params = Record<string, never>;
export type ResBody = {
  qrCodeEntitiesCreated: Entity[];
};
export type ReqBody = SurveyResponse;
export type ReqQuery = Record<string, never>;
