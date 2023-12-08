/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderPage } from './helpers/render';
import { handlers } from './mocks/handlers';

const server = setupServer(
  ...handlers,
  // rest.get('*/v1/getUser', (_, res, ctx) => {
  //   return res(ctx.status(200), ctx.json({ name: 'John Smith', email: 'john@gmail.com' }));
  // }),
  rest.get('*/v1/getUser', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe.only('Login', () => {
  it('Redirects to landing page after login', async () => {
    renderPage('/login');
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent('Log in');
  });
});
