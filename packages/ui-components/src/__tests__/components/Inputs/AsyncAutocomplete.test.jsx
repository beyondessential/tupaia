/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../helpers/testingRenderer';
import { FakeAPI } from '../../../../stories/story-utils/api';
import { AsyncAutocomplete } from '../../../components/Inputs';

const API = new FakeAPI();

const exampleName = 'Chewbacca';
const exampleNameRegex = /chewbacca/i;

const fetchOptions = async () => {
  const users = await API.get('users');
  const knownUser = { id: 'chewy', name: exampleName };
  return users.data.concat(knownUser).map(option => option.name);
};

function renderAsyncAutocomplete() {
  render(
    <AsyncAutocomplete
      fetchOptions={fetchOptions}
      placeholder="Search..."
      muiProps={{
        disablePortal: true,
      }}
    />,
  );
}

describe('asyncAutocomplete', () => {
  it('renders', async () => {
    renderAsyncAutocomplete();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('can can suggest search options', async () => {
    renderAsyncAutocomplete();

    const input = screen.getByRole('textbox');
    await userEvent.type(input, exampleName.substring(0, 3));

    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        expect(screen.getByText(exampleNameRegex)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('can select an option', async () => {
    renderAsyncAutocomplete();

    const input = screen.getByRole('textbox');
    await userEvent.type(input, exampleName.substring(0, 3));

    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const option = screen.getByText(exampleNameRegex);
    userEvent.click(option);

    expect(input.value).toMatch(exampleNameRegex);
  });
});
