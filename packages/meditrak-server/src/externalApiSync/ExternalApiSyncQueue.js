/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/
import autobind from 'react-autobind';
import { Multilock } from '@tupaia/utils';
import { getIsProductionEnvironment } from '../devops';

const LOWEST_PRIORITY = 5;
const BAD_REQUEST_LIMIT = 7;
const DEBOUNCE_DURATION = 100;

export class ExternalApiSyncQueue {
  constructor(models, validator, subscriptionTypes = [], detailGenerator, syncQueueModel) {
    autobind(this);
    this.models = models;
    this.validator = validator;
    this.syncQueueModel = syncQueueModel;
    this.detailGenerator = detailGenerator;
    this.unprocessedChanges = [];
    this.lock = new Multilock();
    this.isProcessing = false;
    subscriptionTypes.forEach(type => models.addChangeHandlerForCollection(type, this.add));
  }

  /**
   * Adds a change to the sync queue, ready to be synced to the aggregation server
   */
  add = async change => {
    this.unprocessedChanges.push(change);
    if (!this.isProcessing) this.processChangesIntoDb();
  };

  async persistToSyncQueue(changes, changeDetails) {
    await Promise.all(
      changes.map(async (change, i) => {
        const changeRecord = {
          ...change,
          // Reset defaults in case this has already been on the sync queue for a while
          is_deleted: false,
          is_dead_letter: false,
          priority: 1,
          change_time: Math.random(), // Force an update, after which point the trigger will update the change_time to more complicated now() + sequence
        };
        if (changeDetails) {
          changeRecord.details = changeDetails[i];
        }
        await this.syncQueueModel.updateOrCreate(
          {
            record_id: change.record_id,
          },
          changeRecord,
        );
      }),
    );
  }

  processDeletes = async changes => {
    const validDeletes = await this.validator.getValidDeletes(changes);
    return this.persistToSyncQueue(validDeletes);
  };

  processUpdates = async changes => {
    const validUpdates = await this.validator.getValidUpdates(changes);
    const changeDetails = await this.detailGenerator.generateDetails(validUpdates);
    return this.persistToSyncQueue(validUpdates, changeDetails);
  };

  processChangesIntoDb = async () => {
    this.isProcessing = true;
    await this.lock.waitWithDebounce(DEBOUNCE_DURATION);
    const start = new Date(); // TODO remove when timing tests are finished
    const unlock = this.lock.createLock();
    console.log('l', new Date() - start);
    const changes = this.unprocessedChanges;
    this.unprocessedChanges = [];
    const changesSeen = new Set();
    const getChangeHash = ({ record_id: recordId, type }) => `${recordId}: ${type}`;
    const uniqueChanges = changes.filter(change => {
      const hash = getChangeHash(change);
      if (changesSeen.has(hash)) return false;
      changesSeen.add(hash);
      return true;
    });
    console.log('1', new Date() - start);
    await this.processDeletes(uniqueChanges);
    console.log('d', new Date() - start);
    await this.processUpdates(uniqueChanges);
    console.log('u', new Date() - start);
    unlock();
    console.log('d', new Date() - start);
    if (this.unprocessedChanges.length > 0) {
      this.processChangesIntoDb();
    } else {
      this.isProcessing = false;
    }
    console.log(
      `Processed ${uniqueChanges.length} of ${changes.length} unique changes`,
      Date.now() - start,
    );
  };

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
