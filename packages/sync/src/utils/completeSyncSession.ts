import { SyncSessionModel, TupaiaDatabase } from '@tupaia/database';
import { dropSnapshotTable } from './manageSnapshotTable';

export const completeSyncSession = async (
  syncSessionModel: SyncSessionModel,
  database: TupaiaDatabase,
  sessionId: string,
  error?: string,
) => {
  // just drop the snapshots, leaving sessions themselves as an artefact that forms a paper trail

  await syncSessionModel.updateById(sessionId, { completed_at: new Date() });

  if (error) {
    await syncSessionModel.markSessionErrored(sessionId, error);
  }
  
  await dropSnapshotTable(database, sessionId);
};
