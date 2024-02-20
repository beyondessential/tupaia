# Prerequisites

- `nvm use`
- `npm install -g watchman`
- `npm install -g yarn`
- Run `npx react-native doctor` to see other requirements
- First time starting `meditrak-app-new`? You must delete the old version of the app from the device.

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> [!NOTE]
> Make sure you have completed the React native [environment setup](https://reactnative.dev/docs/environment-setup) instructions till “Creating a new application” step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript bundler that ships with React Native.

To start Metro, run the following command from the root of your React Native project:

```sh
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro bundler run in its own terminal. Open a new terminal from the root of your React Native project. Run the following command to start your Android or iOS app:

### For Android

```sh
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in your Android Emulator or iOS Simulator shortly, provided you have set up your emulator/simulator correctly.

This is **one** way to run your app; you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let’s modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. **Android**. Press the <kbd>R</kbd> key twice or “Reload” from the “Developer Menu” (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Windows and Linux) or ⌘M (on macOS)) to see your changes!\
**iOS.** Hit ⌘R in your iOS Simulator to reload the app and see your changes!

## Congratulations! 🎉

You’ve successfully run and modified your React Native App. 🥳

### Now what?

- If you want to add this new React Native code to an existing application, check out [Integration with Existing Apps](https://reactnative.dev/docs/integration-with-existing-apps).
- If you’re curious to learn more about React Native, check out the [Introduction](https://reactnative.dev/docs/getting-started) to React Native.

# Troubleshooting

If you can’t get this to work, see [Troubleshooting](https://reactnative.dev/docs/troubleshooting).

# Learn more

To learn more about React Native, take a look at the following resources:

- [React Native website](https://reactnative.dev) – Learn more about React Native.
- [Setting up the development environment](https://reactnative.dev/docs/environment-setup) – An overview of React Native and how to set up your environment.
- [Introduction](https://reactnative.dev/docs/getting-started) – A guided tour of the React Native basics.
- [Blog](https://reactnative.dev/blog) – Read the latest official React Native Blog posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) – The open-source GitHub repository for React Native.
