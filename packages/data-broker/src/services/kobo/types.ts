import { DataServiceSyncGroup as BaseDataServiceSyncGroup } from '../../types';

export type QuestionMapping = Record<
  string,
  {
    koboQuestionCode: string;
    answerMap?: Record<string, string | number>;
  }
>;

export interface KoboSyncGroupConfig {
  koboSurveyCode: string;
  questionMapping: QuestionMapping;
  entityQuestionCode: string;
}

export type DataServiceSyncGroup = BaseDataServiceSyncGroup & { config: KoboSyncGroupConfig };

export interface KoboSubmission {
  [key: string]: string;
  _id: string;
  _submission_time: string;
  _submitted_by: string;
}
