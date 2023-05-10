/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { FakeAPI } from './FakeApi';

export const API = new FakeAPI();

export const connectApi = mapApiToProps => WrappedComponent => props => {
  const apiProps = mapApiToProps(API, props);
  return <WrappedComponent {...apiProps} {...props} />;
};
