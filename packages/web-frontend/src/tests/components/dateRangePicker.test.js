/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../testableRender';
import { DateRangePicker } from '../../components/DateRangePicker';

describe('dateRangePicker', () => {
  it('can display default date for year', () => {
    render(<DateRangePicker granularity="year" startDate="2019-01-01" endDate="2020-06-30" />);
    expect(screen.getByText(/1st January 2019/i)).toBeInTheDocument();
    expect(screen.getByText(/30th June 2020/i)).toBeInTheDocument();
    screen.debug();
  });
  test.todo('can display default date for month');
  test.todo('can display default date for day');
  test.todo('can increase date by 1 year');
  test.todo('can decrease date by 1 year');
  test.todo('can increase date by 1 month');
  test.todo('can decrease date by 1 month');
  test.todo('can increase date by 1 day');
  test.todo('can decrease date by 1 day');
  test.todo('can select a date range');
});

// describe('autocomplete', () => {
//   it('renders', async () => {
//     renderAsyncAutocomplete();
//     expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
//   });
//
//   it('can can suggest search options', async () => {
//     renderAsyncAutocomplete();
//
//     const input = screen.getByRole('textbox');
//     await userEvent.type(input, exampleName.substring(0, 3));
//
//
//     await waitFor(() => {
//       expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
//       expect(screen.getByText(exampleNameRegex)).toBeInTheDocument();
//     }, { timeout: 3000 });
//   });
//
//   it('can select an option', async () => {
//     renderAsyncAutocomplete();
//
//     const input = screen.getByRole('textbox');
//     await userEvent.type(input, exampleName.substring(0, 3));
//
//     await waitFor(() => {
//       expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
//     }, { timeout: 3000 });
//
//     const option = screen.getByText(exampleNameRegex);
//     userEvent.click(option);
//
//     expect(input.value).toMatch(exampleNameRegex);
//   });
// });
