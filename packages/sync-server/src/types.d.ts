import {
  ModelRegistry,
  SyncDeviceTickModel,
  SyncQueuedDeviceModel,
  SyncSessionModel,
  TupaiaDatabase,
} from '@tupaia/database';
import {
  AnswerModel,
  DebugLogModel,
  EntityModel,
  LocalSystemFactModel,
  ProjectModel,
  SurveyResponseModel,
} from '@tupaia/server-boilerplate';

export interface SyncServerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly project: ProjectModel;
  readonly entity: EntityModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly answer: AnswerModel;
  readonly localSystemFact: LocalSystemFactModel;
  readonly debugLog: DebugLogModel;
  readonly syncSession: SyncSessionModel;
  readonly syncDeviceTick: SyncDeviceTickModel;
  readonly syncQueuedDevice: SyncQueuedDeviceModel;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: SyncServerModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: SyncServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: SyncServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
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
  ctes?: string[];
  select?: string[];
  joins?: string[];
  where?: any;
  groupBy?: string[];
}

export interface SnapshotParams {
  since: number;
  userId: string;
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

export interface UnmarkSessionAsProcessingFunction {
  (): Promise<void>;
}

export interface TestModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly syncQueuedDevice: SyncQueuedDeviceModel;
  readonly syncSession: SyncSessionModel;
  readonly syncDeviceTick: SyncDeviceTickModel;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: TestModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: TestModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: TestModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolationLevel'>,
  ): Promise<T>;
}
