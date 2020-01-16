/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class ModelRegistry {
  constructor(database, modelClasses) {
    this.database = database;
    this.modelClasses = modelClasses;
    this.generateModels(database.isSingleton);
  }

  destroy() {
    if (this.database.isSingleton) {
      this.database.destroy();
    }
  }

  async getIsConnected() {
    return this.database.connectionPromise;
  }

  generateModels(isSingleton) {
    // Add models
    Object.entries(this.modelClasses).forEach(([modelName, ModelClass]) => {
      // Create a singleton instance of each model, passing through the change handler if there is
      // one statically defined on the ModelClass and this is the singleton (non transacting)
      // database instance
      const onChange = isSingleton ? ModelClass.onChange : null;
      this[modelName] = new ModelClass(this.database, onChange);
    });
    // Inject other models into each model
    Object.keys(models).forEach(modelName => {
      Object.keys(models).forEach(otherModelName => {
        this[modelName].otherModels[otherModelName] = this[otherModelName];
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
}
