import 'react-native-gesture-handler';
import React from 'react';
import { AppRegistry, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { persistStore, persistCombineReducers, createTransform } from 'redux-persist';
import { ErrorHandler } from 'redux-persist-error-handler';

import Bugsnag from '@bugsnag/react-native';
import { Meditrak } from './Meditrak';
import { api } from './api';
import { database } from './database';
import { reducers } from './reducers';
import { createMiddleware } from './middleware';
import { NavigationConnectedApp } from './navigation';
import { analytics } from './utilities';
import { isBeta, betaBranch } from './version';

const composer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enhancers = composer(
  createMiddleware({
    api,
    database,
    analytics,
  }),
);

const persistedReducers = persistCombineReducers(
  {
    key: isBeta ? betaBranch : 'primary',
    storage: AsyncStorage,
    transforms: [
      createTransform(inboundState => {
        // Do not persist loading state.
        if (inboundState && inboundState.isLoading) {
          return {
            ...inboundState,
            isLoading: false,
          };
        }
        return inboundState;
      }),
    ],
  },
  reducers,
);

const store = createStore(persistedReducers, {}, enhancers);

api.injectReduxStore(store);

const persistedStore = persistStore(store);
// persistedStore.purge(); // Uncomment this to wipe bad redux state during development

Bugsnag.start({
  onError: event => {
    try {
      console.log('onError', event);
      if (store) {
        event.addMetadata('reduxState', store.getState());
        const { authentication = {} } = store.getState();
        const { currentUserId, emailAddress, name } = authentication;
        event.setUser(currentUserId, emailAddress, name);
      }
    } catch (e) {
      console.log(`Failed to set context on Bugsnag error: ${e}`);
    }
  },
});

const App = () => (
  <ErrorHandler persistedStore={persistedStore}>
    <Provider store={store}>
      <Meditrak>
        <NavigationConnectedApp />
      </Meditrak>
    </Provider>
  </ErrorHandler>
);

AppRegistry.registerComponent('TupaiaMediTrak', () => App);

LogBox.ignoreLogs([
  'componentWillReceiveProps',
  'componentWillMount',
  'ViewPropTypes',
  'Failed prop type',
  'Invalid arguments supplied to oneOf',
  'Animated: `useNativeDriver` was not specified.',
  'VirtualizedLists should never be nested inside plain ScrollViews',
]);
