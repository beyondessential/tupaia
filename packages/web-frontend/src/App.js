/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { Provider } from 'react-redux';

import configureStore from './configureStore';
import { AppStyleProviders } from './AppStyleProviders';
import { reactToInitialState, initHistoryDispatcher } from './historyNavigation';
import { fetchInitialData, findLoggedIn } from './actions';

// Set up asynchonous import of the RootScreen to enable webpack to do code splitting.
// Based on https://serverless-stack.com/chapters/code-splitting-in-create-react-app.html
let importRootScreen = () => null;
switch (process.env.REACT_APP_APP_TYPE) {
  case 'mobile':
    importRootScreen = async () => import('./screens/mobile/RootScreen');
    break;

  case 'exporter':
    importRootScreen = async () => import('./screens/exporter/RootScreen');
    break;

  default:
    importRootScreen = async () => import('./screens/desktop/RootScreen');
    break;
}

const store = configureStore();

initHistoryDispatcher(store);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      RootScreen: null,
    };
  }

  async componentDidMount() {
    const { default: RootScreen } = await importRootScreen();
    this.setState({ RootScreen });

    const { dispatch } = store;
    dispatch(fetchInitialData());
    dispatch(findLoggedIn(true));

    reactToInitialState(store);
  }

  render() {
    const { RootScreen } = this.state;
    return (
      <Provider store={store}>
        <AppStyleProviders>{RootScreen ? <RootScreen /> : null}</AppStyleProviders>
      </Provider>
    );
  }
}

export default App;
