import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../helpers/testingRenderer';
import { Toast } from '../../components/Toast';

const exampleString = 'Success Message';
const exampleStringRegex = /success message/i;

describe('toast', () => {
  it('renders', async () => {
    render(<Toast>{exampleString}</Toast>);

    expect(screen.getByText(exampleStringRegex)).toBeInTheDocument();
  });

  it('disappears when the close button is clicked', async () => {
    render(<Toast>{exampleString}</Toast>);

    expect(screen.getByText(exampleStringRegex)).toBeVisible();

    const closeBtn = screen.getByRole('button', { name: /close/i });
    userEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(exampleStringRegex)).not.toBeVisible();
    });
  });

  it('disappears when the timeout is set', async () => {
    render(<Toast timeout={300}>{exampleString}</Toast>);

    expect(screen.getByText(exampleStringRegex)).toBeVisible();

    await waitFor(() => {
      expect(screen.queryByText(exampleStringRegex)).not.toBeVisible();
    });
  });
});
