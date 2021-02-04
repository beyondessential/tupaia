/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../utils/test-utils';
import { Header, HeaderTitle } from '../components/Header';

describe('header', () => {
  it('renders title', async () => {
    render(<Header Title={<HeaderTitle title="Title" />} />);
    expect(await screen.findByText('Title')).toBeInTheDocument();
  });
});
