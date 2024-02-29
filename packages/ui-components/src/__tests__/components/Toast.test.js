/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../helpers/testingRenderer';
import { Toast } from '../../components/Toast';

const exampleString = 'Success Message';
const exampleStringRegex = /success message/i;

describe('toast', () => {
  it('renders', async () => {
    render(<Toast message={exampleString} variant="success" />);

    expect(screen.getByText(exampleStringRegex)).toBeInTheDocument();
  });

  it('disappears when the close button is clicked', async () => {
    render(<Toast message={exampleString} variant="success" />);

    expect(screen.getByText(exampleStringRegex)).toBeVisible();

    const closeBtn = screen.getByRole('button', { name: /Close toast message/i });
    userEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(exampleStringRegex)).not.toBeVisible();
    });
  });
});
