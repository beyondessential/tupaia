import { PermissionsAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export async function requestWritePermission() {
  try {
    // Manually request permissions on android. Will return true immediately if permissions have
    // previously been granted, so is safe to call every time
    const apiLevel = await DeviceInfo.getApiLevel();
    if (apiLevel >= 33) {
      // Android 13+ does not need WRITE_EXTERNAL_STORAGE
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Tupaia File Permission',
        message: 'Tupaia needs access to save files.',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    return false;
  } catch (err) {
    console.warn(err);
    return false;
  }
}
