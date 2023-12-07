import { PermissionsAndroid } from 'react-native';

export async function requestLocationPermission() {
  try {
    // Manually request permissions on android. Will return true immediately if permissions have
    // previously been granted, so is safe to call every time location is needed
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Tupaia Location Permission',
        message: 'Tupaia needs to access your location.',
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

export const noPermissionErrorMessage = 'Geolocation access was not granted.';
