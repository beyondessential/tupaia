import React from 'react';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import PropTypes from 'prop-types';
import { logoutUser } from '../api';

function initPersistor(store) {
  const persistor = persistStore(store);

  // Handle rememberMe flow.
  // The PSSS:activeSession is used to determine if it is a new or existing active session
  if (!window.sessionStorage.getItem('PSSS:activeSession')) {
    const rememberMe = window.localStorage.getItem('PSSS:rememberMe');

    // If it is a new session and the user has not ticked rememberMe, then remove the user data from localStorage
    if (rememberMe === 'false') {
      logoutUser();
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
  children: PropTypes.node.isRequired,
};
