import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../helpers/testingRenderer';
import { Autocomplete } from '../../../components/Inputs';

const exampleCountry = 'Vanuatu';
const exampleCountryRegex = /vanuatu/i;

const options = [
  { id: 1, name: 'Tonga' },
  { id: 2, name: 'Samoa' },
  { id: 3, name: 'American Samoa' },
  { id: 4, name: 'Fiji' },
  { id: 5, name: 'Vanuatu' },
  { id: 6, name: 'Australia' },
  { id: 7, name: 'Cook Islands' },
  { id: 8, name: 'Tokelau' },
  { id: 9, name: 'Kiribati' },
  { id: 10, name: 'Venezuela' },
];

function renderAutocomplete() {
  render(
    <Autocomplete
      label="Autocomplete"
      options={options.map(option => option.name)}
      placeholder="Search..."
      muiProps={{
        disablePortal: true,
      }}
    />,
  );
}

describe('autocomplete', () => {
  it('renders', async () => {
    renderAutocomplete();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('can can suggest search options', async () => {
    renderAutocomplete();

    const input = screen.getByRole('textbox');
    await userEvent.type(input, exampleCountry.substring(0, 3));

    expect(screen.getByText(exampleCountryRegex)).toBeInTheDocument();
  });

  it('can select an option', async () => {
    renderAutocomplete();

    const input = screen.getByRole('textbox');
    await userEvent.type(input, exampleCountry.substring(0, 3));

    const option = screen.getByText(exampleCountryRegex);
    userEvent.click(option);

    expect(input.value).toMatch(exampleCountryRegex);
  });
});
