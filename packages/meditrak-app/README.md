# @tupaia/meditrak-app

## Prerequisites

- `nvm use`
- `brew install watchman`
- Run `npx react-native doctor` to see other requirements
- First time starting `meditrak-app-new`? You must delete the old version of the app from the device.

This is a [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

## Getting Started

> [!NOTE]
> Make sure you have completed the React native [environment setup](https://reactnative.dev/docs/environment-setup) instructions till “Creating a new application” step, before proceeding.

### Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript bundler that ships with React Native.

```sh
yarn workspace @tupaia/meditrak-app run start
```

### Step 2: (iOS only) Install dependencies

From [`/packages/meditrak-app/ios/`](ios/):

```sh
pod install
```

<details>
<summary><h4>If you get <code>[!] Error installing boost</code> <code>Verification checksum was incorrect</code></h4></summary>
Go to <code>/packages/meditrak-app/node_modules/react-native/third-party-podspecs/boost.podspec</code> and modify <code>spec.source</code> to point to <code>https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.bz2</code>:

```pod
  spec.source = { :http => 'https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.bz2',
                  :sha256 => 'f0397ba6e982c4450f27bf32a2a83292aba035b827a5623a14636ea583318c41' }
```

This happens because Boost (dependency of React Native) is no longer available from the server which hosted it when React 0.72 was released.
This is [fixed in React Native 0.75](https://github.com/facebook/react-native/commit/d274826fecfbb67b1b534f4ce9b511a1393625f4) and newer; but older, legacy versions require a workaround like this.
(See https://github.com/boostorg/boost/issues/843 and https://github.com/boostorg/boost/issues/996.)</details>

### Step 3: Start your Application

Let Metro bundler run in its own terminal. In a new terminal:

```sh
yarn workspace @tupaia/meditrak-app run android
```

or

```sh
yarn workspace @tupaia/meditrak-app run ios
```

If everything is set up correctly, you should see your new app running in your Android Emulator or iOS Simulator shortly, provided you have set up your emulator/simulator correctly.

This is **one** way to run your app; you can also run it directly from within Android Studio and Xcode respectively.

### Step 4: Modifying your App

Now that you have successfully run the app, let’s modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. **Android**. Press the <kbd>R</kbd> key twice or “Reload” from the “Developer Menu” (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Windows and Linux) or ⌘M (on macOS)) to see your changes!\
   **iOS.** Hit ⌘R in your iOS Simulator to reload the app and see your changes!

### Congratulations! 🎉

You’ve successfully run and modified your React Native App. 🥳

### Now what?

- If you want to add this new React Native code to an existing application, check out [Integration with Existing Apps](https://reactnative.dev/docs/integration-with-existing-apps).
- If you’re curious to learn more about React Native, check out the [Introduction](https://reactnative.dev/docs/getting-started) to React Native.

## Troubleshooting

If you can’t get this to work, see [Troubleshooting](https://reactnative.dev/docs/troubleshooting).

## Learn more

To learn more about React Native, take a look at the following resources:

- [React Native website](https://reactnative.dev) – Learn more about React Native.
- [Setting up the development environment](https://reactnative.dev/docs/environment-setup) – An overview of React Native and how to set up your environment.
- [Introduction](https://reactnative.dev/docs/getting-started) – A guided tour of the React Native basics.
- [Blog](https://reactnative.dev/blog) – Read the latest official React Native Blog posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) – The open-source GitHub repository for React Native.
