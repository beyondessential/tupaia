/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { MuiThemeProvider as V0MuiThemeProvider } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import { DARKENED_BLUE } from './styles';

import { reactToInitialState, initHistoryDispatcher } from './historyNavigation';

import { fetchInitialData } from './actions';

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

    reactToInitialState(store);
  }

  render() {
    const { RootScreen } = this.state;
    return (
      <Provider store={store}>
        <MuiThemeProvider
          theme={createMuiTheme({ palette: { type: 'dark', primary: { main: DARKENED_BLUE } } })}
        >
          <V0MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
            {RootScreen ? <RootScreen /> : null}
          </V0MuiThemeProvider>
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default App;
