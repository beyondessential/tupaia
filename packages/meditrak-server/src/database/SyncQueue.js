/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import autobind from 'react-autobind';

export class SyncQueue {
  constructor(models, syncQueueModel, modelsToSync) {
    autobind(this);
    this.syncQueueModel = syncQueueModel;
    modelsToSync.forEach(model => {
      models.addChangeHandlerForCollection(model.databaseType, this.add);
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
