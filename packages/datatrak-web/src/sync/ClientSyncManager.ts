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
    // TODO: Implement
  }
}
