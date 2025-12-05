import { generateId } from '@tupaia/database';
import { FACT_DEVICE_ID } from '@tupaia/constants';

import { DatatrakWebModelRegistry } from '../types';

export const getDeviceId = async (models: DatatrakWebModelRegistry): Promise<string> => {
  const deviceId = await models.localSystemFact.get(FACT_DEVICE_ID);

  if (deviceId) {
    return deviceId;
  }

  const newDeviceId = `datatrak-web-${generateId()}`;
  await models.localSystemFact.set(FACT_DEVICE_ID, newDeviceId);
  return newDeviceId;
};
