# meditrak

Android and iOS app for surveying medical facilities

### Development Setup

These are very brief setup instructions with the intention that you either are already familiar with the tools, or can Google them.

To work on Tupaia MediTrak, first you'll need to install the following

- VS Code, or your favourite code editor
  - Also install the eslint extension
- npm
- yarn
  - `npm install -g yarn`
- react-native-cli
  - `npm install -g react-native-cli`
- JDK 8
  - First [download](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and install
  - Add the following to your .bash_profile (see notes below if using Windows)
    - `export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_121.jdk/Contents/Home` (or wherever you installed the JDK)
    - `export PATH=${JAVA_HOME}/bin:$PATH` (i.e. add the place you installed the JDK to the PATH)
- Android SDK
  - Look for 'get just the command line tools' at the bottom of [the Android Studio Download page](https://developer.android.com/studio/index.html)
  - Once downloaded and installed run `sdkmanager --update` and accept the licenses
  - Add the following to your .bash_profile
    - `export ANDROID_HOME=/Users/YourUsernameHere/Library/Android/sdk` (or wherever the Android SDK is installed)
- A phone you can debug on and/or the Android Emulator (e.g. Genymotion) and/or the iOS Simulator (only works on mac)

Steps to get working:

- Clone this repository (see notes below if using Windows)
- Add a .env file to the root directory (look in lastpass)
- `yarn`
- Start your emulator or plug in your device and make sure USB debugging is enabled
- If you are developing/building for ios:
  - `cd ios && pod install`
  - `cd .. && ./node_modules/react-native/scripts/ios-install-third-party.sh`
  - If you get build errors, can be helpful to delete `~/.rncache`, `ios/Pods/*`, `third-party/*`, and then rerun the above
- `react-native run-android` or `react-native run-ios` (for ios, may need to run through the XCode "build and run" button)
- Edit some code, and reload it ('rr' in Genymotion, 'cmd + r' in iOS Simulator, shake a physical device)

For more, see the react-native guides

#### Windows Notes

- Wherever this Readme says to add something to your .bash_profile, instead add/edit the analagous entry in System Variables
  - Control Panel > System & Security > System > Advanced System Settings > Environment Variables
- Before you clone the project from github:

  - Configure git so it stops converting LF endings to CRLF: `git config --global core.autocrlf input`
  - Change the defaults in your IDE (VS Code etc) from CRLF to LF

- It's advisable to get nvm, node (version 10.15.1), yarn and react-native running on the Windows subsystem for linux
- After installing the cli tools download and install android studio

In Android studio Select the "SDK Platforms" tab from within the SDK Manager, then check the box next to "Show Package Details" in the bottom right corner. Look for and expand the Android 9 (Pie) entry, then make sure the following items are checked:

Android SDK Platform 28
Intel x86 Atom_64 System Image or Google APIs Intel x86 Atom System Image
Next, select the "SDK Tools" tab and check the box next to "Show Package Details" here as well. Look for and expand the "Android SDK Build-Tools" entry, then make sure that 28.0.3 is selected.

Finally, click "Apply" to download and install the Android SDK and related build tools.

Creat a new virtual devices with version 28 of android.

Run the device after installation and from a windows command prompt open ./android/ from the checkout directory and enter:
gradlew.bat installDebug

From the WSL you should be able to type:
react-native start
and meditrak should install on the virtual device running

### Making a release build

#### Android

- If you've previously followed the iOS steps, rm -rf third-party && rm -rf node_modules && yarn
- Create gradle.properties within the /android directory, using the contents found on LastPass
- Copy meditrak-release-key.keystore from lastpass (follow instructions to save and decode) and save under /android/app
- Uncomment the line `signingConfig signingConfigs.release` in android/app/build.gradle (don't commit this change, it will break CI builds)
- cd android && ./gradlew assembleRelease

### Beta builds (Android)

1. Create a new beta branch.
2. Change the isBeta boolean to be true.
3. Set BETA_BRANCH in .env to be the name of the branch it should build off (which sets the server URL it should look at, e.g. the beta branch points at beta-api.tupaia.org, dev branch points at dev-api.tupaia.org)
4. Change the Android application id com.tupaiameditrak name in android/app/build.gradle to com.tupaiameditrak.beta
5. Do a build (see above)
6. Open the build on an Android device and make sure there is a semi-transparent orange banner on the bottom of the screen that says 'BETA' or the equivalent name of the branch it is building off.

### Testing

A manual test plan for the Meditrak app is located [here](__tests__/ManualTests.md)
