/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getApi } from '../api';

(async () => {
  const api = getApi();
  console.log('a!');
})();

export * from './NavBar';
export * from './Footer';
export * from './Layout';
