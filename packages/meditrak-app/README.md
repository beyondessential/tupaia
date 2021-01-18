# meditrak

Android and iOS app for surveying medical facilities

### Development Setup

These are very brief setup instructions with the intention that you either are already familiar with the tools, or can Google them.

To work on Tupaia MediTrak, first you'll need to install the following

- VS Code, or your favourite code editor
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
- Add a .env file to the root directory. The required variables are listed in `.env.example`
- `yarn`
- Start your emulator or plug in your device and make sure USB debugging is enabled
- If you are developing/building for ios run `cd ios && pod install && cd ..`
- `react-native run-android` or `react-native run-ios` (for iOS, you will need XCode 12 or greater)
- Edit some code, and reload it ('rr' in Genymotion, 'cmd + r' in iOS Simulator, shake a physical device)

For more, see the react-native guides

#### Windows Notes

- Wherever this Readme says to add something to your .bash_profile, instead add/edit the analagous entry in System Variables
  - Control Panel > System & Security > System > Advanced System Settings > Environment Variables
- Before you clone the project from github:

  - Configure git so it stops converting LF endings to CRLF: `git config --global core.autocrlf input`
  - Change the defaults in your IDE (VS Code etc) from CRLF to LF

- It's advisable to get nvm, node (version 12.18.3), yarn and react-native running on the Windows Subsystem for Linux. If not, you may encounter the following issue:

  ```
  error Invalid regular expression: /(.*\\__fixtures__\\.*|node_modules[\\\]react[\\\]dist[\
  \\].*|website\\node_modules\\.*|heapCapture\\bundle\.js|.*\\__tests__\\.*)$/: Unterminated
  character class. Run CLI with --verbose flag for more details.
  ```

  This is a [documented issue](https://github.com/expo/expo-cli/issues/1074#issuecomment-559220752) with `node ^12.10` and `metro-config < 0.56.4` - see the issue link for a solution.

When simulating a device on windows, there are a couple of options you can use:

**Simulating via Android Studio:**

After installing the Android cli tools download and install android studio

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

**Simulating via Genymotion:**

Genymotion can be installed via chocolatey: https://chocolatey.org/packages/genymotion

However, by default Genymotion is packaged with an older version of the android SDK. Importantly, the Genymotion ADB (Android Debug Bridge) server is version 40 (as of the time of writing this). However the latest ADB which will be installed in WSL via the Android SDK Tools is version 41. Since we will be deploying the application and launching the ABD client from WSL, we need to have a consistent version for Genymotion's ABD server.

The only solution I found for this is to install the Android cli tools for windows and keep them in sync with the version on WSL. To do this, perform the above steps to download JDK 8 and the Android SDK again but this time for windows.

Once installed use the sdkmanager to install the Android SDK packages, run:

```
sdkmanager.bat --install platform-tools
sdkmanager.bat --install platforms;android-<version>
sdkmanager.bat --install build-tools;<version>
sdkmanager.bat --licenses
```

Note (for the package versions, just make them consistent with whatever was installed in WSL when runnning `react-native run-android`)

Now you just need to make Genymotion use the newly installed ADB server, do this by:

1. Launch Genymotion
2. Click 'Settings'
3. Select 'ADB Settings'
4. Choose custom ADB and select the folder containing the Android SDK

Use Genymotion to create a virtual device, and then install the app and debug by running from WSL:

`react-native run-android`

### Making a release build

#### Android

- If you've previously followed the iOS steps, rm -rf third-party && rm -rf node_modules && yarn
- Create gradle.properties within the /android directory, using the contents found on LastPass
- Copy meditrak-release-key.keystore from lastpass (follow instructions to save and decode) and save under /android/app
- Uncomment the line `signingConfig signingConfigs.release` in android/app/build.gradle (don't commit this change, it will break CI builds)
- If building an apk for local installation or distribution to team members: `cd android && ./gradlew assembleRelease`
- If building an aab for the Google Play store: `cd android && ./gradlew bundleRelease`
- You will find the build inside `tupaia/packages/meditrak-app/android/app/build/outputs/apk/release/app_release.apk`

### Beta builds (Android)

1. Create a new beta branch.
2. Change the isBeta boolean to be true.
3. Set BETA_BRANCH in .env to be the name of the branch it should build off (which sets the server URL it should look at, e.g. the beta branch points at beta-api.tupaia.org, dev branch points at dev-api.tupaia.org)
4. Change the Android application id com.tupaiameditrak name in android/app/build.gradle to com.tupaiameditrak.beta
5. Do a build (see above)
6. Open the build on an Android device and make sure there is a semi-transparent orange banner on the bottom of the screen that says 'BETA' or the equivalent name of the branch it is building off.

#### iOS

Can only be done on mac, with Xcode installed

- Be sure to follow the steps under "If you are developing/building for ios:" above
- Open the `TupaiaMediTrak.xcworkspace` file within `meditrak-app/ios`
- Set up signing:
  - Get the provisioning profile, certificate, and private key from LastPass
  - Double click the certificate and private key to add each to your keychain (the private key will require a password, also in LastPass)
  - In XCode, click the "folder" icon underneath the play/stop buttons
  - Select the first entry (with the workspace icon)
  - Go into Signing and Capabilities
  - Under Signing (Release), select "Import Profile" next to Provisioning Profile, and select the profile from LastPass
- Build the archive file (iOS equivalent of apk):
  - To the right of play/stop buttons, select the device as "Generic iOS Device"
  - From the "Product" menu, select "Archive"

### Testing

A manual test plan for the Meditrak app is located [here](__tests__/ManualTests.md)

Note that we currently support version 1.7.81 and above
