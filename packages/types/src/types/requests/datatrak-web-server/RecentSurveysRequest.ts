import type { Entity, Survey } from '../../models';

export type Params = Record<string, never>;

export interface RecentSurvey {
  surveyCode: Survey['code'];
  surveyName: Survey['name'];
  countryName: Entity['name'];
  countryCode: Entity['code'];
  countryId: Entity['id'];
}

export type ResBody = RecentSurvey[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  userId: string;
  projectId?: string;
}
