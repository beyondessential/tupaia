/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { modelClasses as baseModelClasses } from './modelClasses';

const MAX_APP_VERSION = '999.999.999';

// Converts e.g. PermissionGroup -> permissionGroup
const getModelKey = modelName => `${modelName.charAt(0).toLowerCase()}${modelName.slice(1)}`;

export class ModelRegistry {
  constructor(database, extraModelClasses) {
    this.database = database;
    this.modelClasses = {
      ...baseModelClasses,
      ...extraModelClasses,
    };
    this.generateModels();
  }

  closeDatabaseConnections() {
    if (this.database.isSingleton) {
      this.database.closeConnections();
    }
  }

  async getIsConnected() {
    return this.database.connectionPromise;
  }

  generateModels() {
    // Add models
    Object.entries(this.modelClasses).forEach(([modelName, ModelClass]) => {
      // Create a singleton instance of each model, passing through the change handler if there is
      // one statically defined on the ModelClass and this is the singleton (non transacting)
      // database instance
      const modelKey = getModelKey(modelName);
      this[modelKey] = new ModelClass(this.database);
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

  getModelForDatabaseType(databaseType) {
    return Object.values(this).find(model => model.databaseType === databaseType);
  }

  addChangeHandlerForCollection(...args) {
    return this.database.addChangeHandlerForCollection(...args);
  }

  async wrapInTransaction(wrappedFunction) {
    return this.database.wrapInTransaction(transactingDatabase => {
      const transactingModelRegistry = new ModelRegistry(transactingDatabase, this.modelClasses);
      return wrappedFunction(transactingModelRegistry);
    });
  }

  getTypesToSyncWithMeditrak() {
    return Object.values(this)
      .filter(({ meditrakConfig }) => meditrakConfig)
      .map(({ databaseType }) => databaseType);
  }

  getMinAppVersionByType() {
    return Object.values(this).reduce((result, model) => {
      const { databaseType, meditrakConfig } = model;
      const { minAppVersion = MAX_APP_VERSION } = meditrakConfig || {};

      return { ...result, [databaseType]: minAppVersion };
    }, {});
  }

  initialiseNotifiers() {
    Object.values(this).forEach(({ databaseType, notifiers = [] }) => {
      notifiers.forEach(notifier => {
        this.addChangeHandlerForCollection(databaseType, (...args) => notifier(...args, this));
      });
    });
  }
}
