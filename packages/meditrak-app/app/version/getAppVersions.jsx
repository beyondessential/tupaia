import AsyncStorage from '@react-native-async-storage/async-storage';

import DeviceInfo from 'react-native-device-info';
import { APP_VERSION_KEY } from './constants';

export const getDeviceAppVersion = () => DeviceInfo.getVersion();

export const getAppVersions = async () => ({
  current: await getCurrentAppVersion(),
  new: getDeviceAppVersion(),
});

const getCurrentAppVersion = async () => {
  // Get the current version we are upgrading from
  let version;
  try {
    // First check for the current app version in local storage
    version = await AsyncStorage.getItem(APP_VERSION_KEY);
  } catch {
    // Silently ignore errors in getting app version, will be set to 0.0.0 below
  }
  // If it was in not in local storage, just set it to 0.0.0
  if (!version || version.length === 0) {
    version = '0.0.0';
  }
  return version;
};
