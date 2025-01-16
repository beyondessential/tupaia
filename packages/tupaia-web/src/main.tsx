import React from 'react';
import { render as renderReactApp } from 'react-dom';
import App from './App';

if (
  process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_ENABLE_MOCKING &&
  process.env.REACT_APP_ENABLE_MOCKING.toLowerCase() === 'true'
) {
  const { worker } = await import('./__tests__/mocks/browser');
  worker.start({ onUnhandledRequest: 'bypass' });
}

renderReactApp(<App />, document.getElementById('root'));
