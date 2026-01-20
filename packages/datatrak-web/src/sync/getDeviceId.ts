import { generateId } from '@tupaia/database';
import { SyncFact } from '@tupaia/constants';

import { DatatrakWebModelRegistry } from '../types';

export const getDeviceId = async (models: DatatrakWebModelRegistry): Promise<string> => {
  const deviceId = await models.localSystemFact.get(SyncFact.DEVICE_ID);

  if (deviceId) {
    return deviceId;
  }

  const newDeviceId = `datatrak-web-${generateId()}`;
  await models.localSystemFact.set(SyncFact.DEVICE_ID, newDeviceId);
  return newDeviceId;
};
