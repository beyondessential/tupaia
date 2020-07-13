/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../helpers/testingRenderer';
import { Toast } from '..';

test('renders a toast', () => {
  render(<Toast>Success Message</Toast>);
  screen.debug();
  const toast = screen.getByText(/success message/i);
  expect(toast).toBeInTheDocument();
});
