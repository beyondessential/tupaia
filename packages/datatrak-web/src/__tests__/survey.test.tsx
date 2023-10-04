/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { screen, fireEvent } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderSurveyPage } from './helpers/render';
import { handlers } from '../../mocks/handlers';

const server = setupServer(
  ...handlers,
  rest.get('*/v1/getUser', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json({ name: 'John Smith', email: 'john@gmail.com' }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Survey', () => {
  it('displays a survey screen', async () => {
    renderSurveyPage('/survey/test/1');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Demo Land Sections 1-3',
    );
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'Select Kiribati Archipelago',
    );
    fireEvent.click(screen.getByRole('button', { name: /next*/i }));
    await screen.findByText('Select Kiribati Council');
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'Select Kiribati Council',
    );
  });
});
