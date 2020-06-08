/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { render } from 'test-utils';
import { Header } from '../Header';

describe('header', () => {
  it('renders', async () => {
    const { findByText } = render(<Header title="Title" />);
    expect(await findByText('Title')).toBeInTheDocument();
  });
});
