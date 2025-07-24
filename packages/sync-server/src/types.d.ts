import { ModelRegistry, SyncSessionModel, SyncDeviceTickModel } from '@tupaia/database';
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
  readonly syncSession: SyncSessionModel;
  readonly syncDeviceTick: SyncDeviceTickModel;
}

export type SyncServerConfig = {
  maxRecordsPerSnapshotChunk: number;
  lookupTable: {
    perModelUpdateTimeoutMs: number;
    avoidRepull: boolean;
  };
  snapshotTransactionTimeoutMs: number;
  syncSessionTimeoutMs: number;
  maxConcurrentSessions: number;
};

export interface SyncLookupQueryDetails {
  select?: string[];
  joins?: string[];
  where?: any;
  groupBy?: string[];
}

export interface SnapshotParams {
  since: number;
  projectIds: string[];
  deviceId: string;
}

export interface SessionIsProcessingResponse {
  session_is_processing: boolean;
}

export interface GlobalClockResult {
  tick: number;
  tock: number;
}

export interface StartSessionResult {
  sessionId: string;
}

export interface SyncSessionMetadata {
  startedAtTick: number;
}

export interface PullMetadata {
  totalToPull: number;
  pullUntil: number;
}

export interface PrepareSessionResult {
  sessionId: string;
  tick: number;
}

export interface PullInitiationResult {
  sessionId: string;
  totalToPull: number;
  pullUntil: number;
}

export type UnmarkSessionAsProcessingFunction = () => Promise<void>;
