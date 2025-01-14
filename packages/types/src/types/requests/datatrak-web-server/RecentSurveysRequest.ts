import { Country, Survey } from '../../models';

export type Params = Record<string, never>;

export type RecentSurvey = {
  surveyCode: Survey['code'];
  surveyName: Survey['name'];
  countryName: Country['name'];
  countryCode: Country['code'];
  countryId: Country['id'];
};

export type ResBody = RecentSurvey[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  userId: string;
  projectId?: string;
}
