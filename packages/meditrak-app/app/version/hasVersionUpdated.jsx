import { getDeviceAppVersion } from './getAppVersions';

export const hasVersionUpdated = fromVersion => fromVersion !== getDeviceAppVersion();
