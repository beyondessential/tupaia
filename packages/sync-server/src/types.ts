import { ModelRegistry } from '@tupaia/database';
import {
  ProjectModel,
  EntityModel,
  SurveyResponseModel,
  AnswerModel,
  LocalSystemFactModel,
  DebugLogModel,
} from '@tupaia/server-boilerplate';

export interface SyncServerModelRegistry extends ModelRegistry {
  readonly project: ProjectModel;
  readonly entity: EntityModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly answer: AnswerModel;
  readonly localSystemFact: LocalSystemFactModel;
  readonly debugLog: DebugLogModel;
}

export type SyncServerConfig = {
  maxRecordsPerSnapshotChunk: number;
  lookupTable: {
    perModelUpdateTimeoutMs: number;
    avoidRepull: boolean;
  };
};

export interface SyncLookupQueryDetails {
  select?: string[];
  joins?: string[];
  where?: any;
}
