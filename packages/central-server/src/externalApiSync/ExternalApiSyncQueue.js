import autobind from 'react-autobind';
import { getIsProductionEnvironment } from '@tupaia/utils';
import { getSyncQueueChangeTime } from '@tupaia/tsutils';

const LOWEST_PRIORITY = 5;
const BAD_REQUEST_LIMIT = 7;
const MAX_CHANGES_PER_BATCH = 20000; // breaks in production at around 50k changes
const SERVER_START_TIME = Date.now(); // used to avoid syncing old changes in non-production environments

export class ExternalApiSyncQueue {
  constructor(
    models,
    validator,
    subscriptionTypes = [],
    detailGenerator,
    syncQueueModel,
    sideEffectHandler,
    syncQueueKey,
  ) {
    autobind(this);
    this.changeIndex = 0;
    this.models = models;
    this.validator = validator;
    this.syncQueueModel = syncQueueModel;
    this.detailGenerator = detailGenerator;
    this.sideEffectHandler = sideEffectHandler;
    this.unprocessedChanges = [];
    this.isProcessing = false;
    subscriptionTypes.forEach(type =>
      models.addChangeHandlerForCollection(type, this.add, syncQueueKey),
    );
  }

  /**
   * Adds a change to the sync queue, ready to be synced to the aggregation server
   */
  add = async change => {
    this.unprocessedChanges.push(change);
    if (!this.isProcessing) this.processChangesIntoDb();
  };

  async persistToSyncQueue(changes, changeDetails) {
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const changeRecord = {
        ...change,
        // Reset defaults in case this has already been on the sync queue for a while
        is_deleted: false,
        is_dead_letter: false,
        priority: 1,
        change_time: getSyncQueueChangeTime(this.changeIndex++),
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
    }
  }

  triggerSideEffects = async changes => {
    if (this.sideEffectHandler) {
      await this.sideEffectHandler.triggerSideEffects(changes);
    }
  };

  processDeletes = async changes => {
    const validDeletes = await this.validator.getValidDeletes(changes);
    return this.persistToSyncQueue(validDeletes);
  };

  processUpdates = async changes => {
    const validUpdates = await this.validator.getValidUpdates(changes);
    try {
      const changeDetails = await this.detailGenerator.generateDetails(validUpdates);
      return this.persistToSyncQueue(validUpdates, changeDetails);
    } catch (e) {
      // Something went wrong with generating change details, possibly because the entity hierarchy
      // cache is still being built as the result of an entity change. Put this batch of changes
      // back on the queue to attempt processing again
      this.unprocessedChanges.push(...validUpdates);
      return null;
    }
  };

  processChangesIntoDb = async () => {
    this.isProcessing = true;
    const changes = this.unprocessedChanges.slice(0, MAX_CHANGES_PER_BATCH);
    this.unprocessedChanges = this.unprocessedChanges.slice(MAX_CHANGES_PER_BATCH);
    const changesSeen = new Set();
    const getChangeHash = ({ record_id: recordId, type }) => `${recordId}: ${type}`;
    const uniqueChanges = changes.filter(change => {
      const hash = getChangeHash(change);
      if (changesSeen.has(hash)) return false;
      changesSeen.add(hash);
      return true;
    });
    await this.triggerSideEffects(uniqueChanges);
    await this.processDeletes(uniqueChanges);
    await this.processUpdates(uniqueChanges);
    if (this.unprocessedChanges.length > 0) {
      this.processChangesIntoDb();
    } else {
      this.isProcessing = false;
      this.changeIndex = 0;
    }
  };

  /**
   * Returns the oldest changes on the sync queue, up to numberToGet. Returns a promise, which can be
   * awaited by the calling function.
   */
  async get(numberToGet) {
    const criteria = {
      is_dead_letter: false,
      is_deleted: false,
    };
    // on non-production environments, avoid syncing the same changes to DHIS2 from multiple
    // different deployments, as DHIS2 can't handle it
    if (!getIsProductionEnvironment()) {
      // don't sync records older than priority 5, to avoid multiple deployments syncing the same
      // records that are going around and around the queue
      criteria.priority = {
        comparator: '<',
        comparisonValue: 5,
      };
      // don't sync changes that happened before the server was started, to avoid multiple
      // deployments syncing identical changes that came from the overnight snapshot
      criteria.change_time = {
        comparator: '>',
        comparisonValue: SERVER_START_TIME,
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
   */
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
    // If the bad request count is over the limit, mark it as a dead letter
    if (change.bad_request_count > BAD_REQUEST_LIMIT) {
      return this.syncQueueModel.updateById(change.id, { is_dead_letter: true });
    }
    // Otherwise, increment the bad request count
    return this.syncQueueModel.updateById(change.id, {
      bad_request_count: change.bad_request_count + 1,
    });
  }
}
