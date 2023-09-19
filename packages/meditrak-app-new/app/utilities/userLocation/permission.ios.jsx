// ios will take care of its own permission dialog whenever we first attempt to use location

export async function requestLocationPermission() {
  return true;
}
