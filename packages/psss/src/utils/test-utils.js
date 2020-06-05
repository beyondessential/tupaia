/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { createStore, applyMiddleware } from 'redux';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import thunk from 'redux-thunk';
import { ThemeProvider } from 'styled-components';
import { theme } from '../theme';
import { createReducers } from '../createReducers';
import { API } from '../api';
import { initialState} from './initialState';

function initStore() {
  const store = createStore(createReducers, applyMiddleware(thunk.withExtraArgument({ api: API })));
  API.injectReduxStore(store);
  return store;
}

const store = initStore();

// eslint-disable-next-line react/prop-types
const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <StylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    </Provider>
  );
};

const customRender = (ui, options) => render(ui, { wrapper: Providers, ...options });

// override render method
export { customRender as render };
// ----------


const loggedInStore = createStore(createReducers, initialState);

// console.log('CREATE REDUCERS', createReducers());
console.log('STORE', loggedInStore.getState());

// eslint-disable-next-line react/prop-types
const LoggedInProviders = ({ children }) => {
  return (
    <Provider store={loggedInStore}>
      <StylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    </Provider>
  );
};

const loggedInRender = (ui, options) => render(ui, { wrapper: LoggedInProviders, ...options });

export { loggedInRender };
