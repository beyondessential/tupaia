/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import autobind from 'react-autobind';

export class SyncQueue {
  constructor(models, syncQueueModel, typesToSync, modelValidator) {
    autobind(this);
    this.syncQueueModel = syncQueueModel;
    typesToSync.forEach(type => {
      if (modelValidator) {
        modelValidator(models.getModelForDatabaseType(type));
      }
      models.addChangeHandlerForCollection(type, this.add);
    });
  }

  add(change) {
    this.syncQueueModel.updateOrCreate(
      {
        record_id: change.record_id,
      },
      {
        ...change,
        change_time: Math.random(), // Force an update, after which point the trigger will update the change_time to more complicated now() + sequence
      },
    );
  }
}
