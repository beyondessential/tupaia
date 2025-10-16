import { generateId } from '@tupaia/database';
import { DatatrakWebModelRegistry } from '../types';

export const initDeviceId = async (models: DatatrakWebModelRegistry): Promise<string> => {
  let deviceId = await models.localSystemFact.get('deviceId');
  if (!deviceId) {
    deviceId = `datatrak-web-${generateId()}`;
    await models.localSystemFact.set('deviceId', deviceId);
  }
  return deviceId;
};
