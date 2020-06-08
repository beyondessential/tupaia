/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { render } from 'test-utils';
import { Header } from '../Header';

describe('header', () => {
  it('renders', () => {
    const { getByText } = render(<Header title="Title" />);
    expect(getByText('Title')).toBeInTheDocument();
  });
});
