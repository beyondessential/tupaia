/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/
import autobind from 'react-autobind';
import { DebouncingQueue } from '@tupaia/utils';
import { getIsProductionEnvironment } from '../devops';

const LOWEST_PRIORITY = 5;
const BAD_REQUEST_LIMIT = 7;

export class ExternalApiSyncQueue {
  constructor(
    models,
    validator,
    subscriptionTypes = [],
    generateChangeRecordAdditions,
    syncQueueModel,
  ) {
    autobind(this);
    this.models = models;
    this.validator = validator;
    this.syncQueueModel = syncQueueModel;
    this.generateChangeRecordAdditions = generateChangeRecordAdditions;
    this.taskQueue = new DebouncingQueue();
    subscriptionTypes.forEach(type => models.addChangeHandlerForCollection(type, this.add));
  }

  /**
   * Adds a change to the sync queue, ready to be synced to the aggregation server
   */
  async add(change, record) {
    await this.taskQueue.runTask(change.record_id, async () => {
      const isValid = await this.validator(change);
      if (!isValid) {
        // do not add an invalid survey response
        return;
      }

      const changeRecordAdditions = await this.generateChangeRecordAdditions({
        models: this.models,
        recordType: change.record_type,
        changedRecord: record,
      });
      const modifiedChangeRecord = {
        ...change,
        ...changeRecordAdditions,
      };

      await this.syncQueueModel.updateOrCreate(
        {
          record_id: modifiedChangeRecord.record_id,
        },
        {
          ...modifiedChangeRecord,
          // Reset defaults in case this has already been on the sync queue for a while
          is_deleted: false,
          is_dead_letter: false,
          priority: 1,
          change_time: Math.random(), // Force an update, after which point the trigger will update the change_time to more complicated now() + sequence
        },
      );
      console.log(change.record_type);
    });
  }

  /**
   * Returns the oldest changes on the sync queue, up to numberToGet. Returns a promise, which can be
   * awaited by the calling function.
   **/
  async get(numberToGet) {
    const criteria = {
      is_dead_letter: false,
      is_deleted: false,
    };
    if (!getIsProductionEnvironment()) {
      criteria.priority = {
        comparator: '<',
        comparisonValue: 5,
      };
    }
    const changes = await this.syncQueueModel.find(criteria, {
      sort: ['priority', 'change_time'],
      limit: numberToGet,
    });
    return changes.map(change => ({
      ...change,
      details: JSON.parse(change.details),
    }));
  }

  /**
   * Removes the given change from the sync queue, i.e. marks it as 'used'. Returns a promise, which
   * can be awaited by the calling function.
   **/
  use(change) {
    return this.syncQueueModel.updateById(change.id, { is_deleted: true });
  }

  deprioritise(change) {
    // Update also causes change_time to be reset to current time
    // so it will slot in at the back of its new priority group
    const newPriority = Math.min(LOWEST_PRIORITY, change.priority + 1); // Cap the priority
    return this.syncQueueModel.updateById(change.id, { priority: newPriority });
  }

  registerBadRequest(change) {
    // Update also causes change_time to be reset to current time
    // so it will slot in at the back of its new priority group
    if (change.bad_request_count > BAD_REQUEST_LIMIT) {
      return this.syncQueueModel.updateById(change.id, { is_dead_letter: true });
    } // Cap the priority
    return this.syncQueueModel.updateById(change.id, {
      bad_request_count: change.bad_request_count + 1,
    });
  }
}
