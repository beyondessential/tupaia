import { SyncSnapshotAttributes } from '@tupaia/sync';
import { post, put } from '../api';

// TODO: Move to config model RN-1668
const LIMIT = 10000;

export const pushOutgoingChanges = async (
  sessionId: string,
  changes: SyncSnapshotAttributes[],
  deviceId: string,
): Promise<void> => {
  let startOfPage = 0;
  while (startOfPage < changes.length) {
    const endOfPage = Math.min(startOfPage + LIMIT, changes.length);
    const page = changes.slice(startOfPage, endOfPage);

    await post(`sync/${sessionId}/push`, { data: { changes: page } });

    startOfPage = endOfPage;
  }
  await put(`sync/${sessionId}/push/complete`, { data: { deviceId } });
};
