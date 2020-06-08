/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { render } from '@testing-library/react';
import { AppProviders } from '../AppProviders';
import { API } from '../api';
import { createReducers } from '../createReducers';

const reducer = combineReducers(createReducers());
const store = createStore(reducer, applyMiddleware(thunk.withExtraArgument({ api: API })));

const Providers = props => <AppProviders store={store} {...props} />;

const customRender = (ui, options) => render(ui, { wrapper: Providers, ...options });

export { customRender as render };
