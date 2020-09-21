/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { render } from '../../utils/test-utils';
import { Header, HeaderTitle } from '../Header';

describe('header', () => {
  it('renders title', async () => {
    const { findByText } = render(<Header Title={<HeaderTitle title="Title" />} />);
    expect(await findByText('Title')).toBeInTheDocument();
  });
});
