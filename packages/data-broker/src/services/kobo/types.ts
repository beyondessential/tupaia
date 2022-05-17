/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { SyncGroup as BaseSyncGroup } from '../../types';

export type QuestionMapping = Record<
  string,
  {
    koboQuestionCode: string;
    answerMap: Record<string, string | number>;
  }
>;

export interface KoboSyncGroupConfig {
  internalSurveyCode: string;
  questionMapping: QuestionMapping;
  entityQuestionCode: string;
}

export type SyncGroup = BaseSyncGroup & { config: KoboSyncGroupConfig };

export interface KoboSubmission {
  [key: string]: string;
  _id: string;
  _submission_time: string;
  _submitted_by: string;
}
