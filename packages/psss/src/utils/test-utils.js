/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '../AppProviders';
import { API, FakeAPI } from '../api';
import { rootReducer } from '../store/rootReducer';

const enhancers = compose(applyMiddleware(thunk.withExtraArgument({ api: API, fakeApi: FakeAPI })));

const customRender = (ui, defaultState = {}) => {
  const store = createStore(rootReducer, defaultState, enhancers);
  return render(<AppProviders store={store}>{ui}</AppProviders>);
};

export { customRender as render };
