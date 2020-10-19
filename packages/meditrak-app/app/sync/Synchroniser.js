/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Scheduler } from 'sussol-utilities';

import { YellowBox } from 'react-native';
import { ChangeQueue } from './ChangeQueue';
import {
  setSyncProgress,
  setSyncProgressMessage,
  setSyncTotal,
  setSyncError,
  setSyncIsSyncing,
  setSyncComplete,
} from './actions';
import { LATEST_SERVER_SYNC_TIMESTAMP } from '../settings';
import { loadSocialFeedLatest } from '../social';
import { getSyncMigrations } from './syncMigrations';
import { Change } from '../database/types';

YellowBox.ignoreWarnings(['Setting a timer']);

const MEASURE_BATCH_IN_RECORDS = 'records';
const MEASURE_BATCH_IN_DATA = 'kilobytes';

const KILOBYTE = 1024; // bytes

const MIN_BATCH_RECORDS = 1;
const MAX_BATCH_RECORDS = 500;
const MIN_BATCH_PACKET = 4 * KILOBYTE;
const MAX_BATCH_PACKET = 100 * KILOBYTE;

const OPTIMAL_BATCH_SPEED = 2000; // 2 seconds in millisecond

const DEFAULT_SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const API_ENDPOINT = 'changes';

/**
 * Provides core synchronization functionality: pushing and pulling changes regularly
 * @param  {Realm}     database       The local database
 * @param  {Api}       api            Encapsulates fetching, takes care of auth etc
 */
export class Synchroniser {
  constructor(database, api) {
    this.api = api;
    this.database = database;
    this.changeQueue = new ChangeQueue(database);
    this.scheduler = new Scheduler();
    this.isEnabled = false;
    this.currentSyncPromise = null;
    this.synchronise = this.synchronise.bind(this);
    this.batchMeasure = MEASURE_BATCH_IN_RECORDS;
    this.batchSize = MIN_BATCH_RECORDS;
  }

  /**
   * Starts regular syncing
   * @param  {integer}   syncInterval   Optional - The number of milliseconds between syncs
   */
  enable(dispatch, syncInterval = DEFAULT_SYNC_INTERVAL) {
    if (this.isEnabled) return; // Cannot enable an already running synchroniser
    this.scheduler.schedule(() => this.synchronise(dispatch), syncInterval);
    this.isEnabled = true;
  }

  /**
   * Stops regular syncing
   */
  disable() {
    this.scheduler.clearAll();
    this.isEnabled = false;
  }

  /**
   * Enqueue a change
   * @param  {string} action     The action that caused the change, e.g. 'SubmitSurvey'
   * @param  {string} recordId   Id of main record affected by the change (may imply child records)
   * @return {none}
   */
  addChange(action, recordId) {
    this.changeQueue.push(action, recordId);
  }

  /**
   * A batch can be measured in number of records or amount of data
   * @param  {string} newBatchMeasure     The measure to use, either records or data
   * @return {none}
   */
  setBatchMeasure(newBatchMeasure) {
    this.batchMeasure = newBatchMeasure;
  }

  /**
   * Reset batch size to minimum.
   */
  resetBatchSize() {
    this.batchSize =
      this.batchMeasure === MEASURE_BATCH_IN_RECORDS ? MIN_BATCH_RECORDS : MIN_BATCH_PACKET;
  }

  /**
   * Set the current batch size based on how long the previous batch took to complete.
   *
   * The batch size is a number between 3 and 500 and is determined by a combination
   * of server performance and connection speed.
   *
   * @param {number} lastBatchSyncDuration
   */
  setBatchSize(lastBatchSyncDuration) {
    const durationPerRecord = lastBatchSyncDuration / this.batchSize;
    const optimalBatchSize = OPTIMAL_BATCH_SPEED / durationPerRecord;
    let newBatchSize = optimalBatchSize;

    newBatchSize = Math.floor(newBatchSize);
    newBatchSize = Math.max(
      newBatchSize,
      this.batchMeasure === MEASURE_BATCH_IN_RECORDS ? MIN_BATCH_RECORDS : MIN_BATCH_PACKET,
    );
    newBatchSize = Math.min(
      newBatchSize,
      this.batchMeasure === MEASURE_BATCH_IN_RECORDS ? MAX_BATCH_RECORDS : MAX_BATCH_PACKET,
    );
    this.batchSize = newBatchSize;
  }

  /**
   * Either initiate a sync and return a promise that resolves when it finishes, or if there is
   * already a sync underway, just return the promise of the current sync
   * @return {Promise}   A promise that resolves with true if sync succeeds, or false if it fails
   */
  async synchronise(dispatch) {
    // Return immediately if not authenticated
    const isAuthenticated = await this.api.getIsAuthenticated();
    if (!isAuthenticated) return false;

    // If sync is not already running, start sync, and store the promise to await if anyone else
    // monitor progress
    if (this.currentSyncPromise === null) {
      this.currentSyncPromise = this.asynchronouslySynchronise(dispatch);
    }

    const syncWasSuccessful = await this.currentSyncPromise; // Await the current sync
    this.currentSyncPromise = null; // Clear the current sync now it has finished
    return syncWasSuccessful; // Return whether sync was successful
  }

  /**
   * Carry out a synchronization, first pushing any local changes, then pulling
   * down remote changes and integrating them into the local database. Resolves the current sync
   * promise with true on success, or false on failure
   */
  async asynchronouslySynchronise(dispatch) {
    // Create progress setter, which dispatches a redux action
    const setTotal = totalCount => dispatch(setSyncTotal(totalCount));
    const setProgress = currentCount => dispatch(setSyncProgress(currentCount));
    const setProgressMessage = message => dispatch(setSyncProgressMessage(message));
    const setError = errorMessage => dispatch(setSyncError(errorMessage));
    const setIsSyncing = isSyncing => dispatch(setSyncIsSyncing(isSyncing));
    const setComplete = time => dispatch(setSyncComplete(time));
    const refreshFeed = () => dispatch(loadSocialFeedLatest());

    // Using async/await here means that any errors thrown by push or pull
    // will be passed up as a rejection of the promise returned by synchronise
    try {
      setIsSyncing(true);

      await this.runMigrations(setProgressMessage);

      setProgressMessage('Getting change count');
      const outgoingChangeCount = this.changeQueue.length;

      const lastSyncTime = this.getLastSyncTime();
      const incomingChangeCount = await this.getIncomingChangeCount(lastSyncTime);

      const totalCount = outgoingChangeCount + incomingChangeCount;

      setTotal(totalCount);

      this.synchroniserProgress = 0;

      this.setBatchMeasure(MEASURE_BATCH_IN_DATA);
      this.resetBatchSize();

      setProgressMessage('Pushing');
      await this.push(setProgress, outgoingChangeCount);

      this.setBatchMeasure(MEASURE_BATCH_IN_RECORDS);
      this.resetBatchSize();

      setProgressMessage('Pulling');
      await this.pull(setProgress, incomingChangeCount, lastSyncTime);

      setComplete(new Date().getTime());
      refreshFeed(); // Pull latest feed items whilst the device has an Internet connection.

      setProgressMessage('Sync completed successfuly');

      return true; // Successful
    } catch (error) {
      setError(error.message);
      setIsSyncing(false);
      return false; // Unsuccessful
    }
  }

  /**
   * Push batches of changes to the local database up to the remote server, until
   * all local changes have been synced.
   * @return {Promise} Resolves if successful, or passes up any error thrown
   */
  async push(setProgress, total, progress = 0) {
    try {
      if (progress >= total) {
        return; // Done recursing through changes
      }
      setProgress(this.synchroniserProgress);

      // Get batch of outgoing changes and send them
      const changes = this.changeQueue.nextWithinThreshold(this.batchSize);
      const { requestDuration } = await this.pushChanges(changes.map(({ payload }) => payload));

      // Take the successfully sent batch of changes off the queue requiring sync
      this.changeQueue.use(changes.map(({ change }) => change));

      const batchCount = changes.length;

      this.synchroniserProgress += batchCount;

      const currentProgress = progress + batchCount;

      this.setBatchSize(requestDuration);

      // Recurse to send the next batch of changes to the server
      await this.push(setProgress, total, currentProgress);
    } catch (error) {
      throw error; // Throw error up
    }
  }

  /**
   * Pushes a collection of changes to the remote sync server
   * @param  {array}   changesSyncJson JSON of the records to be sent
   * @return {Promise}         Resolves if successful, or passes up any error thrown
   */
  async pushChanges(changesSyncJson) {
    const startTime = new Date().getTime();
    try {
      const responseJson = await this.api.post(API_ENDPOINT, {}, JSON.stringify(changesSyncJson));
      if (responseJson.error && responseJson.error.length > 0) {
        throw new Error(responseJson.error);
      }

      const endTime = new Date().getTime();
      return {
        requestDuration: endTime - startTime,
      };
    } catch (error) {
      throw error; // Throw error up
    }
  }

  /**
   * Recursively checks how many changes left to pull, pulls in a batch, and calls itself
   * @return {Promise} Resolves if successful, or passes up any error thrown
   */
  async pull(setProgress, total, since, numberChangesPulled = 0) {
    try {
      if (numberChangesPulled >= total) {
        return; // Done recursing through changes
      }
      setProgress(this.synchroniserProgress);

      // Get a batch of changes and integrate them
      const { changes, requestDuration } = await this.getIncomingChanges(
        since,
        numberChangesPulled,
      );
      if (!changes || changes.length === 0) {
        throw new Error(`Expected ${total - numberChangesPulled} more changes, but received none`);
      }

      this.database.integrateChanges(changes);

      // Save the current timestamp we are in sync with on the server
      const latestChangeTimestamp = changes.reduce(
        (currentLatestTimestamp, change) => Math.max(change.timestamp, currentLatestTimestamp),
        parseFloat(this.getLastSyncTime()),
      );
      this.database.setSetting(LATEST_SERVER_SYNC_TIMESTAMP, latestChangeTimestamp);

      this.synchroniserProgress += changes.length;

      const newNumberPulled = numberChangesPulled + changes.length;

      this.setBatchSize(requestDuration);

      // Recurse to get the next batch of changes from the server
      await this.pull(setProgress, total, since, newNumberPulled);
    } catch (error) {
      throw error; // Throw error up
    }
  }

  getLastSyncTime = () => this.database.getSetting(LATEST_SERVER_SYNC_TIMESTAMP) || 0;

  /**
   * Returns the number of changes left to pull
   * @return {Promise} Resolves with the change count, or passes up any error thrown
   */
  async getIncomingChangeCount(since, filters = {}) {
    try {
      const responseJson = await this.api.get(`${API_ENDPOINT}/count`, { since, ...filters });
      if (responseJson.error && responseJson.error.length > 0) {
        throw new Error(responseJson.error);
      }
      if (typeof responseJson.changeCount !== 'number') {
        throw new Error('Unexpected response from server');
      }
      return responseJson.changeCount;
    } catch (error) {
      throw error; // Throw error up
    }
  }

  /**
   * Returns the next batch of incoming changes
   * @param  {integer} limit The maximum number of changes to fetch
   * @return {Promise}       Resolves with the changes, or passes up any error thrown
   */
  async getIncomingChanges(since, offset, filters = {}) {
    const startTime = new Date().getTime();

    try {
      const responseJson = await this.api.get(API_ENDPOINT, {
        since,
        offset,
        limit: this.batchSize,
        ...filters,
      });
      if (responseJson.error && responseJson.error.length > 0) {
        throw new Error(responseJson.error);
      }
      const endTime = new Date().getTime();

      return {
        changes: responseJson,
        requestDuration: endTime - startTime,
      };
    } catch (error) {
      throw error; // Throw error up
    }
  }

  async runMigrations(setProgressMessage) {
    const migrationMethods = await getSyncMigrations(this.database);

    if (migrationMethods.length === 0) {
      return;
    }

    for (let m = 0; m < migrationMethods.length; m++) {
      setProgressMessage(`Running migration ${m + 1}/${migrationMethods.length}`);
      await migrationMethods[m](this, setProgressMessage);
    }
  }
}
