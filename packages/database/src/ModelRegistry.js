/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { modelClasses as baseModelClasses } from './modelClasses';

const MAX_APP_VERSION = '999.999.999';

// Converts e.g. PermissionGroup -> permissionGroup
const getModelKey = modelName => `${modelName.charAt(0).toLowerCase()}${modelName.slice(1)}`;

export class ModelRegistry {
  /**
   * @param {import('./TupaiaDatabase').TupaiaDatabase} database
   * @param {import('./DatabaseModel').DatabaseModel[]} [extraModelClasses]
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
   * @returns {import('./DatabaseModel').DatabaseModel}
   */
  getModelForDatabaseRecord(databaseRecord) {
    return Object.values(this).find(model => model.databaseRecord === databaseRecord);
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

  async wrapInTransaction(wrappedFunction) {
    return this.database.wrapInTransaction(async transactingDatabase => {
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
      return wrappedFunction(transactingModelRegistry);
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
