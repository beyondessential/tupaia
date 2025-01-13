export const accessPolicy = { DL: ['Public'] };
export const refreshToken = 'refreshToken';

const userId = 'xxx';
const checkPassword = password => password === 'validPassword';
export const verifiedUser = {
  id: userId,
  checkPassword,
  checkIsEmailUnverified: () => false,
};
export const unverifiedUser = {
  id: userId,
  checkPassword,
  checkIsEmailUnverified: () => true,
};

const baseMeditrakDeviceDetails = {
  installId: 'zzz',
  platform: 'ios',
};
export const MEDITRAK_DEVICE_DETAILS = {
  modern: {
    ...baseMeditrakDeviceDetails,
    appVersion: '1.7.107',
  },
  ultraModern: {
    ...baseMeditrakDeviceDetails,
    appVersion: '5.42.0',
  },
  legacy: {
    ...baseMeditrakDeviceDetails,
    appVersion: '1.7.106',
  },
  ultraLegacy: {
    ...baseMeditrakDeviceDetails,
    appVersion: '0.5.1',
  },
};

const getDbRecordFromDetails = ({ installId, platform, appVersion }) => ({
  install_id: installId,
  platform,
  app_version: appVersion,
});
export const MEDITRAK_DEVICE_BY_REFRESH_TOKEN = {
  modern: getDbRecordFromDetails(MEDITRAK_DEVICE_DETAILS.modern),
  ultraModern: getDbRecordFromDetails(MEDITRAK_DEVICE_DETAILS.ultraModern),
  legacy: getDbRecordFromDetails(MEDITRAK_DEVICE_DETAILS.legacy),
  ultraLegacy: getDbRecordFromDetails(MEDITRAK_DEVICE_DETAILS.ultraLegacy),
};
