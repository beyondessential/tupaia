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
  /**
   * @param {typeof BaseDatabase} database
   * @param {Record<string, typeof DatabaseModel>} [extraModelClasses]
   */
  constructor(database, extraModelClasses, useNotifiers = false, schemata = null) {
    this.database = database;
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
   * @returns {DatabaseModel[]}
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
   * @param {<T = unknown>(models: typeof BaseDatabase) => Promise<T | void>} wrappedFunction
   * @param {Knex.TransactionConfig} [transactionConfig]
   * @returns {Promise<Knex.Transaction>}
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
   * @param {(models: typeof BaseDatabase) => Promise<unknown>} wrappedFunction
   * @param {Omit<Knex.TransactionConfig, 'readOnly'>} [transactionConfig]
   * @returns {Promise<Knex.Transaction>}
   */
  async wrapInReadOnlyTransaction(wrappedFunction, transactionConfig = {}) {
    return await this.wrapInTransaction(wrappedFunction, { ...transactionConfig, readOnly: true });
  }

  /**
   * @param {(models: typeof BaseDatabase) => Promise<unknown>} wrappedFunction
   * @param {Omit<Knex.TransactionConfig, 'isolationLevel'>} [transactionConfig]
   * @returns {Promise<Knex.Transaction>}
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
