/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderComponent } from '../../helpers/render';
import { Reports } from '../../../features/Reports';
import { screen } from '@testing-library/react';

jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    useFormContext: jest.fn().mockReturnValue({ errors: {} }),
  };
});

// const entitiesData = [
//   {
//     id: '5d3f8844bf6b4031bfff591b',
//     parentName: 'Demo Land',
//     code: 'DL_South West',
//     name: 'South West',
//     type: 'district',
//   },
//   {
//     id: '5d3f8844df283d31bfd08fc3',
//     parentName: 'Demo Land',
//     code: 'DL_North',
//     name: 'North',
//     type: 'district',
//   },
//   {
//     id: '5d3f88448ec12f31bf9c694e',
//     parentName: 'Demo Land',
//     code: 'DL_South East',
//     name: 'South East',
//     type: 'district',
//   },
// ];

const countriesData = [
  {
    id: '5d3f8844bf6b4031bfff591b',
    code: 'DL',
    name: 'Demo Land',
    type: 'country',
  },
  {
    id: '5d3f8844bf6b4031bfff591b',
    code: 'FJ',
    name: 'Fiji',
    type: 'country',
  },
];

const surveysData = [
  {
    id: '5d3f8844bf6b4031bfff591b',
    code: 'BCD_DL',
    name: 'Basic clinic data - Demo Land',
  },
  {
    id: '5d3f8844bf6b4031bfff591b',
    code: 'BCD_CK',
    name: 'Basic clinic data - Cook Islands',
  },
];

const userData = {
  project: { code: 'explore' },
  country: { code: 'DL' },
  hasAdminPanelAccess: true,
};

const server = setupServer(
  rest.get('*/v1/entities', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(countriesData));
  }),
  rest.get('*/v1/getUser', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(userData));
  }),
  rest.get('*/v1/surveys', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(surveysData));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Reports', () => {
  it('renders the Reports component without crashing', () => {
    renderComponent(<Reports />);
  });

  it('renders the surveys input', async () => {
    renderComponent(<Reports />);
    const surveysInput = await screen.findByText(/Survey/);
    expect(surveysInput).toBeInTheDocument();
  });
});
