import log from 'winston';

import { ScheduledTask } from '@tupaia/server-utils';
import { completeSyncSession } from '@tupaia/sync';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';

import { SyncServerModelRegistry } from '../types';

const STALE_SESSION_SECONDS = 60 * 60;

export class StaleSessionCleaner extends ScheduledTask {
  constructor(models: SyncServerModelRegistry) {
    super(models, 'StaleSessionCleaner', '* * * * *');
  }

  async run() {
    const models = this.models as SyncServerModelRegistry;
    const staleSessions = await models.syncSession.find({
      completed_at: null,
      [QUERY_CONJUNCTIONS.RAW]: {
        sql: `start_time < NOW() - INTERVAL '${STALE_SESSION_SECONDS} seconds'`,
      },
    });
    for (const session of staleSessions) {
      await completeSyncSession(
        models.syncSession,
        models.database,
        session.id,
        'Session marked as completed due to inactivity',
      );
      const durationMs = Date.now() - session.startTime;
      log.info('StaleSyncSessionCleaner.closedStaleSession', {
        sessionId: session.id,
        durationMs,
      });
    }
  }
}
