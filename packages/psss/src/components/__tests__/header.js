/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { render } from 'test-utils';
import { Header } from '../Header';

test('renders header', () => {
  render(<Header title="Title" />);
});
