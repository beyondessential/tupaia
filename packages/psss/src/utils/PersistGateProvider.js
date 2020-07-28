/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import PropTypes from 'prop-types';

function initPersistor(store) {
  const persistor = persistStore(store, null);

  // if you run into problems with redux state, call "purge()" in the dev console
  if (window.localStorage.getItem('queuePurge')) {
    persistor.purge();
    window.localStorage.setItem('queuePurge', '');
  }

  window.purge = () => {
    window.localStorage.setItem('queuePurge', 'true');
    window.location.reload();
  };

  return persistor;
}

export const PersistGateProvider = ({ children, store }) => {
  if (process.env.NODE_ENV === 'test') {
    return children;
  }
  return <PersistGate persistor={initPersistor(store)}>{children}</PersistGate>;
};

PersistGateProvider.propTypes = {
  store: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired,
};
