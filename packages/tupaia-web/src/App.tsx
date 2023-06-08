/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { AppStyleProviders } from './AppStyleProviders';
import { Routes } from './Routes';
import { Layout } from './layout';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  return (
    <AppStyleProviders>
      <BrowserRouter>
        {/** The Layout component needs to be inside BrowserRouter so that Link component from react-router-dom can be used (in menu etc.) */}
        <Layout>
          <Routes />
        </Layout>
      </BrowserRouter>
    </AppStyleProviders>
  );
};

export default App;
