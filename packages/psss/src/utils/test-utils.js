/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import thunk from 'redux-thunk';
import { ThemeProvider } from 'styled-components';
import { theme } from '../theme';
import { auth } from '../store';
import { API } from '../api';
import { initialState } from './initialState';

const reducers = combineReducers({
  auth,
});

// eslint-disable-next-line react/prop-types
const createProviders = isLoggedIn => ({ children }) => {
  const state = isLoggedIn ? initialState : {};
  const store = createStore(
    reducers,
    state,
    applyMiddleware(thunk.withExtraArgument({ api: API })),
  );
  API.injectReduxStore(store);

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

const customRender = (ui, options) => render(ui, { wrapper: createProviders(), ...options });

// override render method
export { customRender as render };

export const loggedInRender = (ui, options) =>
  render(ui, { wrapper: createProviders(true), ...options });
