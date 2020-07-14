/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../helpers/testingRenderer';
import { Toast } from '..';

describe('toast', () => {
  it('renders', async () => {
    render(<Toast>Success Message</Toast>);
    const toast = screen.getByText(/success message/i);
    expect(toast).toBeInTheDocument();
  });

  it('disappears when the close button is clicked', async () => {
    render(<Toast>Success Message</Toast>);
    const closeBtn = screen.getByRole('button', { name: /close/i });
    userEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/success message/i)).not.toBeVisible();
    });
  });

  it('disappears when the timeout is set', async () => {
    render(<Toast timeout={100}>Success Message</Toast>);
    await waitFor(() => {
      expect(screen.queryByText(/success message/i)).not.toBeVisible();
    });
  });
});
