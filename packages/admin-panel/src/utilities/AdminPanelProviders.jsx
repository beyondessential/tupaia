import React from 'react';
import { StoreProvider } from './StoreProvider';
import { TupaiaApi } from '../api';
import { ApiProvider } from './ApiProvider';

// eslint-disable-next-line react/prop-types
export const AdminPanelProviders = ({ children }) => {
  const api = new TupaiaApi();

  return <ApiProvider api={api}>{children}</ApiProvider>;
};

// For use in external apps such as LESMIS
// eslint-disable-next-line react/prop-types
export const AdminPanelDataProviders = ({ children, config }) => {
  const api = new TupaiaApi(config);

  return (
    <StoreProvider api={api}>
      <ApiProvider api={api}>{children}</ApiProvider>
    </StoreProvider>
  );
};
