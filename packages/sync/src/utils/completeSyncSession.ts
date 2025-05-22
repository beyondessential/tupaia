import { SyncSessionModel, TupaiaDatabase } from '@tupaia/database';
import { dropSnapshotTable } from './manageSnapshotTable';

export const completeSyncSession = async (
  syncSessionModel: SyncSessionModel,
  database: TupaiaDatabase,
  sessionId: string,
  error?: string,
) => {
  // just drop the snapshots, leaving sessions themselves as an artefact that forms a paper trail
  const session = await syncSessionModel.findById(sessionId);
  session!.completed_at = new Date();
  if (error) {
    await session?.markErrored(error);
  }
  await session?.save();
  await dropSnapshotTable(database, sessionId);
};
