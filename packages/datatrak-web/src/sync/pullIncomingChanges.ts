
import { post } from '../api';

export const initiatePull = async (
  sessionId: string,
  since: number,
  projectIds: string[],
  deviceId: string,
) => {
  console.log('ClientSyncManager.pull.waitingForCentral');
  const body = { since, projectIds, deviceId };
  return post(`sync/${sessionId}/pull/initiate`, { data: body });
};
