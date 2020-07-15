/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import 'whatwg-fetch';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../helpers/testingRenderer';
import { AsyncAutocomplete } from '..';

const fetchOptions = async query => {
  const response = await fetch(`https://swapi.dev/api/people/?search=${query}`);
  const data = await response.json();
  return data.results;
};

function renderAsyncAutocomplete() {
  render(
    <AsyncAutocomplete
      fetchOptions={fetchOptions}
      placeholder="Search..."
      muiProps={{
        disablePortal: true,
      }}
    />
  );
}

describe('autocomplete', () => {
  it('renders', async () => {
    renderAsyncAutocomplete();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('can can suggest search options', async () => {
    renderAsyncAutocomplete();

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'chew');


    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByText(/chewbacca/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('can select an option', async () => {
    renderAsyncAutocomplete();

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'chew');

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    const option = screen.getByText(/chewbacca/i);
    userEvent.click(option);

    expect(input.value).toMatch(/chewbacca/i);
  });
});
