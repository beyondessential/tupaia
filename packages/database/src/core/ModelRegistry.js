/**
 * @typedef {import('knex').Knex} Knex
 * @typedef {import('../server/TupaiaDatabase').TupaiaDatabase} TupaiaDatabase
 * @typedef {import('./BaseDatabase').BaseDatabase} BaseDatabase
 * @typedef {import('./DatabaseModel').DatabaseModel} DatabaseModel
 */

import { modelClasses as baseModelClasses } from './modelClasses';

const MAX_APP_VERSION = '999.999.999';

// Converts e.g. PermissionGroup -> permissionGroup
const getModelKey = modelName => `${modelName.charAt(0).toLowerCase()}${modelName.slice(1)}`;

export class ModelRegistry {
  /** @readonly @type {import('./modelClasses').AccessRequestModel} */
  accessRequest;
  /** @readonly @type {import('./modelClasses').AnalyticsModel} */
  analytics;
  /** @readonly @type {import('./modelClasses').AncestorDescendantRelationModel} */
  ancestorDescendantRelation;
  /** @readonly @type {import('./modelClasses').AnswerModel} */
  answer;
  /** @readonly @type {import('./modelClasses').ApiClientModel} */
  apiClient;
  /** @readonly @type {import('./modelClasses').ApiRequestLogModel} */
  apiRequestLog;
  /** @readonly @type {import('./modelClasses').CommentModel} */
  comment;
  /** @readonly @type {import('./modelClasses').CountryModel} */
  country;
  /** @readonly @type {import('./modelClasses').DashboardModel} */
  dashboard;
  /** @readonly @type {import('./modelClasses').DashboardItemModel} */
  dashboardItem;
  /** @readonly @type {import('./modelClasses').DashboardMailingListModel} */
  dashboardMailingList;
  /** @readonly @type {import('./modelClasses').DashboardMailingListEntryModel} */
  dashboardMailingListEntry;
  /** @readonly @type {import('./modelClasses').DashboardRelationModel} */
  dashboardRelation;
  /** @readonly @type {import('./modelClasses').DashboardReportModel} */
  dashboardReport;
  /** @readonly @type {import('./modelClasses').DataElementModel} */
  dataElement;
  /** @readonly @type {import('./modelClasses').DataElementDataGroupModel} */
  dataElementDataGroup;
  /** @readonly @type {import('./modelClasses').DataElementDataServiceModel} */
  dataElementDataService;
  /** @readonly @type {import('./modelClasses').DataGroupModel} */
  dataGroup;
  /** @readonly @type {import('./modelClasses').DataServiceEntityModel} */
  dataServiceEntity;
  /** @readonly @type {import('./modelClasses').DataServiceSyncGroupModel} */
  dataServiceSyncGroup;
  /** @readonly @type {import('./modelClasses').DataTableModel} */
  dataTable;
  /** @readonly @type {import('./modelClasses').DebugLogModel} */
  debugLog;
  /** @readonly @type {import('./modelClasses').DhisInstanceModel} */
  dhisInstance;
  /** @readonly @type {import('./modelClasses').EntityModel} */
  entity;
  /** @readonly @type {import('./modelClasses').EntityHierarchyModel} */
  entityHierarchy;
  /** @readonly @type {import('./modelClasses').EntityParentChildRelationModel} */
  entityParentChildRelation;
  /** @readonly @type {import('./modelClasses').EntityRelationModel} */
  entityRelation;
  /** @readonly @type {import('./modelClasses').ExternalDatabaseConnectionModel} */
  externalDatabaseConnection;
  /** @readonly @type {import('./modelClasses').FacilityModel} */
  facility;
  /** @readonly @type {import('./modelClasses').FeedItemModel} */
  feedItem;
  /** @readonly @type {import('./modelClasses').GeographicalAreaModel} */
  geographicalArea;
  /** @readonly @type {import('./modelClasses').IndicatorModel} */
  indicator;
  /** @readonly @type {import('./modelClasses').LandingPageModel} */
  landingPage;
  /** @readonly @type {import('./modelClasses').LegacyReportModel} */
  legacyReport;
  /** @readonly @type {import('./modelClasses').LocalSystemFactModel} */
  localSystemFact;
  /** @readonly @type {import('./modelClasses').MapOverlayModel} */
  mapOverlay;
  /** @readonly @type {import('./modelClasses').MapOverlayGroupModel} */
  mapOverlayGroup;
  /** @readonly @type {import('./modelClasses').MapOverlayGroupRelationModel} */
  mapOverlayGroupRelation;
  /** @readonly @type {import('./modelClasses').MeditrakDeviceModel} */
  meditrakDevice;
  /** @readonly @type {import('./modelClasses').MeditrakSyncQueueModel} */
  meditrakSyncQueue;
  /** @readonly @type {import('./modelClasses').OneTimeLoginModel} */
  oneTimeLogin;
  /** @readonly @type {import('./modelClasses').OptionModel} */
  option;
  /** @readonly @type {import('./modelClasses').OptionSetModel} */
  optionSet;
  /** @readonly @type {import('./modelClasses').PermissionGroupModel} */
  permissionGroup;
  /** @readonly @type {import('./modelClasses').ProjectModel} */
  project;
  /** @readonly @type {import('./modelClasses').QuestionModel} */
  question;
  /** @readonly @type {import('./modelClasses').RefreshTokenModel} */
  refreshToken;
  /** @readonly @type {import('./modelClasses').ReportModel} */
  report;
  /** @readonly @type {import('./modelClasses').SupersetInstanceModel} */
  supersetInstance;
  /** @readonly @type {import('./modelClasses').SurveyModel} */
  survey;
  /** @readonly @type {import('./modelClasses').SurveyGroupModel} */
  surveyGroup;
  /** @readonly @type {import('./modelClasses').SurveyResponseModel} */
  surveyResponse;
  /** @readonly @type {import('./modelClasses').SurveyResponseCommentModel} */
  surveyResponseComment;
  /** @readonly @type {import('./modelClasses').SurveyScreenModel} */
  surveyScreen;
  /** @readonly @type {import('./modelClasses').SurveyScreenComponentModel} */
  surveyScreenComponent;
  /** @readonly @type {import('./modelClasses').SyncDeviceTickModel} */
  syncDeviceTick;
  /** @readonly @type {import('./modelClasses').SyncGroupLogModel} */
  syncGroupLog;
  /** @readonly @type {import('./modelClasses').SyncQueuedDeviceModel} */
  syncQueuedDevice;
  /** @readonly @type {import('./modelClasses').SyncSessionModel} */
  syncSession;
  /** @readonly @type {import('./modelClasses').TaskModel} */
  task;
  /** @readonly @type {import('./modelClasses').TaskCommentModel} */
  taskComment;
  /** @readonly @type {import('./modelClasses').TombstoneModel} */
  tombstone;
  /** @readonly @type {import('./modelClasses').UserModel} */
  user;
  /** @readonly @type {import('./modelClasses').UserCountryAccessAttemptModel} */
  userCountryAccessAttempt;
  /** @readonly @type {import('./modelClasses').UserEntityPermissionModel} */
  userEntityPermission;
  /** @readonly @type {import('./modelClasses').UserFavouriteDashboardItemModel} */
  userFavouriteDashboardItem;

  /**
   * @type {<ModelRegistryT extends ModelRegistry = ModelRegistry, DatabaseT extends BaseDatabase = BaseDatabase>(database: DatabaseT, extraModelClasses?: Record<string, typeof DatabaseModel>, useNotifiers?: boolean, schemata?: unknown) => ModelRegistryT>}
   */
  constructor(database, extraModelClasses, useNotifiers = false, schemata = null) {
    this.database = database;

    /** @type {Record<string, typeof DatabaseModel>} */
    this.modelClasses = {
      ...baseModelClasses,
      ...extraModelClasses,
    };

    this.generateModels(schemata);
    if (useNotifiers) {
      this.initialiseNotifiers();
    }
  }

  async closeDatabaseConnections() {
    if (this.database.isSingleton) {
      await this.database.closeConnections();
    }
  }

  async getIsConnected() {
    return this.database.connectionPromise;
  }

  generateModels(schemata) {
    // Add models
    Object.entries(this.modelClasses).forEach(([modelName, ModelClass]) => {
      // Create a singleton instance of each model, passing through the change handler if there is
      // one statically defined on the ModelClass and this is the singleton (non transacting)
      // database instance
      const modelKey = getModelKey(modelName);
      const schema = schemata && schemata[modelKey];
      this[modelKey] = new ModelClass(this.database, schema);
    });
    // Inject other models into each model
    Object.keys(this.modelClasses).forEach(modelName => {
      const modelKey = getModelKey(modelName);
      Object.keys(this.modelClasses).forEach(otherModelName => {
        const otherModelKey = getModelKey(otherModelName);
        this[modelKey].otherModels[otherModelKey] = this[otherModelKey];
      });
    });
  }

  /**
   * @param {string} databaseRecord
   * @returns {DatabaseModel}
   */
  getModelForDatabaseRecord(databaseRecord) {
    return Object.values(this).find(model => model.databaseRecord === databaseRecord);
  }

  /**
   * @returns {(DatabaseModel)[]}
   */
  getModels() {
    return Object.values(this).filter(model => Boolean(model.databaseRecord));
  }

  /**
   * @param {string} databaseRecord
   * @returns {string | undefined} modelName
   */
  getModelNameForDatabaseRecord(databaseRecord) {
    const modelEntry = Object.entries(this).find(
      ([, model]) => model.databaseRecord === databaseRecord,
    );
    if (!modelEntry) {
      return undefined;
    }

    return modelEntry[0];
  }

  addChangeHandlerForCollection(...args) {
    return this.database.addChangeHandlerForCollection(...args);
  }

  /**
   * @param {<ReturnT = unknown, ModelRegistryT extends ModelRegistry = ModelRegistry>(models: ModelRegistryT) => Promise<ReturnT>} wrappedFunction
   * @param {Knex.TransactionConfig} [transactionConfig]
   * @returns {Promise<ReturnT>}
   */
  async wrapInTransaction(wrappedFunction, transactionConfig = {}) {
    return await this.database.wrapInTransaction(async transactingDatabase => {
      const schemata = {};
      await Promise.all(
        Object.keys(this.modelClasses).map(async modelName => {
          const modelKey = getModelKey(modelName);
          schemata[modelKey] = await this[modelKey].fetchSchema();
        }),
      );
      const transactingModelRegistry = new ModelRegistry(
        transactingDatabase,
        this.modelClasses,
        false,
        schemata,
      );
      return await wrappedFunction(transactingModelRegistry);
    }, transactionConfig);
  }

  /**
   * @param {<ReturnT = unknown, ModelRegistryT extends ModelRegistry = ModelRegistry>(models: ModelRegistryT) => Promise<ReturnT>} wrappedFunction
   * @param {Omit<Knex.TransactionConfig, 'readOnly'>} [transactionConfig]
   * @returns {Promise<ReturnT>}
   */
  async wrapInReadOnlyTransaction(wrappedFunction, transactionConfig = {}) {
    return await this.wrapInTransaction(wrappedFunction, { ...transactionConfig, readOnly: true });
  }

  /**
   * @param {<ReturnT = unknown, ModelRegistryT extends ModelRegistry = ModelRegistry>(models: ModelRegistryT) => Promise<ReturnT>} wrappedFunction
   * @param {Omit<Knex.TransactionConfig, 'isolationLevel'>} [transactionConfig]
   * @returns {Promise<ReturnT>}
   */
  async wrapInRepeatableReadTransaction(wrappedFunction, transactionConfig = {}) {
    return await this.wrapInTransaction(wrappedFunction, {
      ...transactionConfig,
      isolationLevel: 'repeatable read',
    });
  }

  getTypesToSyncWithMeditrak() {
    return Object.values(this)
      .filter(({ meditrakConfig }) => meditrakConfig)
      .map(({ databaseRecord }) => databaseRecord);
  }

  getMinAppVersionByType() {
    return Object.values(this).reduce((result, model) => {
      const { databaseRecord, meditrakConfig } = model;
      const { minAppVersion = MAX_APP_VERSION } = meditrakConfig || {};

      return { ...result, [databaseRecord]: minAppVersion };
    }, {});
  }

  initialiseNotifiers() {
    Object.values(this).forEach(({ databaseRecord, notifiers = [] }) => {
      notifiers.forEach(notifier => {
        this.addChangeHandlerForCollection(databaseRecord, (...args) => notifier(...args, this));
      });
    });
  }
}
