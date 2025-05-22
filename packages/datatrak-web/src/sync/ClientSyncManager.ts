import { modelClasses, ModelRegistry } from '@tupaia/database';
import {
  FACT_LAST_SUCCESSFUL_SYNC_PULL,
  createSnapshotTable,
  dropAllSnapshotTables,
} from '@tupaia/sync';
import { CentralServerConnection } from './CentralServerConnection';
import { DatatrakDatabase } from '../database/DatatrakDatabase';
import { pullIncomingChanges } from './pullIncomingChanges';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: modelClasses.LocalSystemFact;
}

export class ClientSyncManager {
  private database: DatatrakDatabase;

  private models: DatatrakWebModelRegistry;

  private centralServer: CentralServerConnection;

  private currentSyncPromise: Promise<void> | null = null;

  constructor(
    models: DatatrakWebModelRegistry,
    centralServer: CentralServerConnection,
  ) {
    this.models = models;
    this.database = models.database;
    this.centralServer = centralServer;
  }

  async runSync() {
    if (this.currentSyncPromise) {
      throw new Error(
        'It should not be possible to call "runSync" while an existing run is active',
      );
    }

    const { sessionId, startedAtTick: newSyncClockTime } =
      await this.centralServer.startSyncSession({ lastSyncedTick: 0 });

    // clear previous temp data, in case last session errored out or server was restarted
    await dropAllSnapshotTables(this.database);

    console.log('ClientSyncManager.receivedSessionInfo', {
      sessionId,
      startedAtTick: newSyncClockTime,
    });

    await this.pushChanges();

    await this.pullChanges(sessionId);

    // await this.centralServer.endSyncSession(sessionId);

    // const durationMs = Date.now() - startTime;
    // log.info('FacilitySyncManager.completedSession', {
    //   durationMs,
    // });
    // this.lastDurationMs = durationMs;
    // this.lastCompletedAt = new Date();

    // clear temp data stored for persist
    // await dropSnapshotTable(this.sequelize, sessionId);
    return { queued: false, ran: true };
  }

  async pushChanges() {
    // TODO: Implement
  }

  async pullChanges(sessionId: string) {
    const pullSince = (await this.models.localSystemFact.get(FACT_LAST_SUCCESSFUL_SYNC_PULL)) || -1;

    await createSnapshotTable(this.database, sessionId);
    const { totalPulled, pullUntil } = await pullIncomingChanges(
      this.centralServer,
      this.models,
      sessionId,
      pullSince,
    );
  }
}
