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
import {
  EntityParentChildRelationModel,
  QuestionModel,
  SurveyScreenComponentModel,
  SurveyScreenModel,
  TaskCommentModel,
  TaskModel,
} from '@tupaia/tsmodels';

export interface SyncServerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly user: UserModel;
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
  pauseSnapshotProcess?: () => Promise<void>;
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

export interface TestSyncServerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly syncLookup: SyncLookupModel;
  readonly country: CountryModel;
  readonly entityHierarchy: EntityHierarchyModel;
  readonly entityRelation: EntityRelationModel;
  readonly entityParentChildRelation: EntityParentChildRelationModel;
  readonly optionSet: OptionSetModel;
  readonly option: OptionModel;
  readonly permissionGroup: PermissionGroupModel;
  readonly surveyGroup: SurveyGroupModel;
  readonly survey: SurveyModel;
  readonly surveyScreen: SurveyScreenModel;
  readonly surveyScreenComponent: SurveyScreenComponentModel;
  readonly question: QuestionModel;
  readonly surveyResponse: SurveyResponseModel;
  readonly answer: AnswerModel;
  readonly task: TaskModel;
  readonly taskComment: TaskCommentModel;
  readonly localSystemFact: LocalSystemFactModel;
  readonly debugLog: DebugLogModel;
  readonly userEntityPermission: UserEntityPermissionModel;
  readonly user: UserModel;
  readonly project: ProjectModel;
  readonly entity: EntityModel;
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
