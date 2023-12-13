/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render as renderReactApp } from 'react-dom';
import { App } from './App';

if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./__tests__/mocks/browser');
  worker.start();
}

renderReactApp(<App />, document.getElementById('root'));
