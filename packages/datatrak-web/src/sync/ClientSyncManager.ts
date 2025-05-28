import { modelClasses, ModelRegistry } from '@tupaia/database';
import {
  FACT_LAST_SUCCESSFUL_SYNC_PULL,
  SYNC_DIRECTIONS,
  createClientSnapshotTable,
  dropAllSnapshotTables,
  dropSnapshotTable,
  getModelsForDirection,
  saveIncomingInMemoryChanges,
  saveIncomingSnapshotChanges,
} from '@tupaia/sync';
import { DatatrakDatabase } from '../database/DatatrakDatabase';
import { initiatePull, pullIncomingChanges } from './pullIncomingChanges';
import {
  getPullVolumeType,
  PROCESS_STREAM_DATA_FUNCTIONS,
  PullVolumeType,
} from './processStreamedData';
import { post, remove } from '../api';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: modelClasses.LocalSystemFact;
}

export interface SyncResult {
  ran: boolean;
}

export class ClientSyncManager {
  private database: DatatrakDatabase;

  private models: DatatrakWebModelRegistry;

  private currentSyncPromise: Promise<SyncResult> | null = null;

  private projectIds: string[];

  private deviceId: string;

  constructor(models: DatatrakWebModelRegistry, projectIds: string[], deviceId: string) {
    this.models = models;
    this.database = models.database;
    this.projectIds = projectIds;
    this.deviceId = deviceId;
  }

  async triggerSync() {
    if (this.currentSyncPromise) {
      const result = await this.currentSyncPromise;
      return { enabled: true, ...result };
    }

    // set up a common sync promise to avoid double sync
    this.currentSyncPromise = this.runSync();

    // make sure sync promise gets cleared when finished, even if there's an error
    try {
      const result = await this.currentSyncPromise;
      return { enabled: true, ...result };
    } finally {
      this.currentSyncPromise = null;
    }
  }

  async runSync() {
    if (this.currentSyncPromise) {
      throw new Error(
        'It should not be possible to call "runSync" while an existing run is active',
      );
    }

    const startTime = Date.now();
    const { sessionId, startedAtTick: newSyncClockTime } = await this.startSyncSession();

    // clear previous temp data, in case last session errored out or server was restarted
    await dropAllSnapshotTables(this.database);

    console.log('ClientSyncManager.receivedSessionInfo', {
      sessionId,
      startedAtTick: newSyncClockTime,
    });

    await this.pushChanges();

    await this.pullChanges(sessionId);

    await this.endSyncSession(sessionId);

    const durationMs = Date.now() - startTime;
    console.log('FacilitySyncManager.completedSession', {
      durationMs,
    });

    // clear temp data stored for persist
    await dropSnapshotTable(this.database, sessionId);

    return { ran: true };
  }

  async startSyncSession() {
    return post('sync', {
      data: { lastSyncedTick: 0 },
    });
  }

  async endSyncSession(sessionId: string) {
    return remove(`sync/${sessionId}`);
  }

  async pushChanges() {
    // TODO: Implement
  }

  async pullChanges(sessionId: string) {
    try {
      console.log('ClientSyncManager.pullChanges', {
        sessionId,
      });
      const pullSince =
        (await this.models.localSystemFact.get(FACT_LAST_SUCCESSFUL_SYNC_PULL)) || -1;

      console.log('ClientSyncManager.createClientSnapshotTable', {
        sessionId,
      });
      await createClientSnapshotTable(this.database, sessionId);

      console.log('ClientSyncManager.initiatePull', {
        sessionId,
      });
      const { totalToPull, pullUntil } = await initiatePull(
        sessionId,
        pullSince,
        this.projectIds,
        this.deviceId,
      );
      const pullVolumeType = getPullVolumeType(pullSince, totalToPull);
      const processStreamedDataFunction = PROCESS_STREAM_DATA_FUNCTIONS[pullVolumeType];

      const runPull = async (models: ModelRegistry) =>
        pullIncomingChanges(models, sessionId, processStreamedDataFunction);

      const { totalObjects } =
        pullVolumeType === PullVolumeType.Initial
          ? await this.models.wrapInTransaction(async models => runPull(models))
          : await runPull(this.models);

      console.log('pullVolumeType', pullVolumeType);
      await this.models.wrapInTransaction(async models => {
        const incomingModels = getModelsForDirection(models, SYNC_DIRECTIONS.PULL_FROM_CENTRAL);
        if (pullVolumeType === PullVolumeType.IncrementalLow) {
          saveIncomingInMemoryChanges(models, totalObjects);
        } else if (pullVolumeType === PullVolumeType.IncrementalHigh) {
          saveIncomingSnapshotChanges(incomingModels, sessionId);
        }

        // update the last successful sync in the same save transaction - if updating the cursor fails,
        // we want to roll back the rest of the saves so that we don't end up detecting them as
        // needing a sync up to the central server when we attempt to resync from the same old cursor
        console.log('FacilitySyncManager.updatingLastSuccessfulSyncPull', { pullUntil });
        await this.models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, pullUntil);
      });
    } catch (error) {
      console.error('ClientSyncManager.pullChanges', {
        sessionId,
        error,
      });
      throw error;
    }
  }
}
