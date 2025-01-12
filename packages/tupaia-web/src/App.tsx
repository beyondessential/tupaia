import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { Routes } from './Routes';

const App = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </AppProviders>
  );
};

export default App;
