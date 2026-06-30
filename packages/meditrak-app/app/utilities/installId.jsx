import AsyncStorage from '@react-native-async-storage/async-storage';

import { generateMongoId } from './generateId';

const INSTALL_ID_KEY = 'installId';

/**
 * Returns a stable per-install identifier, persisted in AsyncStorage.
 *
 * This replaces App Center's getInstallId() (App Center has been retired). On first
 * call after upgrade, a new id is generated, so existing installs will be recorded as
 * a new meditrak_device on the server.
 */
export const getInstallId = async () => {
  const existingInstallId = await AsyncStorage.getItem(INSTALL_ID_KEY);
  if (existingInstallId) return existingInstallId;

  const installId = generateMongoId();
  await AsyncStorage.setItem(INSTALL_ID_KEY, installId);
  return installId;
};
