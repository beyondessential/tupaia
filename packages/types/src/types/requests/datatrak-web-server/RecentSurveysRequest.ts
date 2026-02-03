import type { Entity, Survey, UserAccount, Project } from '../../models';

export type Params = Record<string, never>;

export interface RecentSurvey {
  countryCode: Entity['code'];
  countryId: Entity['id'];
  countryName: Entity['name'];
  surveyCode: Survey['code'];
  surveyName: Survey['name'];
}

export type ResBody = RecentSurvey[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  userId: UserAccount['id'];
  projectId: Project['id'];
}
