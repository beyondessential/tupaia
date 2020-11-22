/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import PropTypes from 'prop-types';

function initPersistor(store) {
  const persistor = persistStore(store);

  if (!window.sessionStorage.getItem('PSSS:activeSession')) {
    const rememberMe = window.localStorage.getItem('PSSS:rememberMe');
    if (rememberMe === 'false') {
      persistor.purge();
    }
    window.sessionStorage.setItem('PSSS:activeSession', 'true');
  }

  return persistor;
}

export const PersistGateProvider = ({ children, store }) => {
  // Do not persist state for tests
  if (process.env.NODE_ENV === 'test') {
    return children;
  }
  return <PersistGate persistor={initPersistor(store)}>{children}</PersistGate>;
};

PersistGateProvider.propTypes = {
  store: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired,
};
