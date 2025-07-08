import { calculatePageLimit, SyncSnapshotAttributes } from '@tupaia/sync';
import { post, put } from '../api';

export const pushOutgoingChanges = async (
  sessionId: string,
  changes: SyncSnapshotAttributes[],
  deviceId: string,
): Promise<void> => {
  let startOfPage = 0;
  let limit = calculatePageLimit();
  while (startOfPage < changes.length) {
    const endOfPage = Math.min(startOfPage + limit, changes.length);
    const page = changes.slice(startOfPage, endOfPage);

    const startTime = Date.now();
    await post(`sync/${sessionId}/push`, { data: { changes: page } });
    const endTime = Date.now();

    startOfPage = endOfPage;

    limit = calculatePageLimit(limit, endTime - startTime);
  }
  await put(`sync/${sessionId}/push/complete`, { data: { deviceId } });
};
