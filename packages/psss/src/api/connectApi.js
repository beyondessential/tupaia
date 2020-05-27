/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { FakeAPI } from './singletons';

export const connectApi = mapApiToProps => WrappedComponent => props => {
  const apiProps = mapApiToProps(FakeAPI, props);
  return <WrappedComponent {...apiProps} {...props} />;
};
