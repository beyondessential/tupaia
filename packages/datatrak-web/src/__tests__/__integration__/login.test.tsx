import '../mocks/matchMedia.mock'; // Import before components under test

import { fireEvent, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderPage } from '../helpers/render';
import { handlers } from '../mocks/handlers';

const doLogin = async () => {
  const userInput = await screen.findByLabelText(/Email*/);
  const passwordInput = await screen.findByLabelText(/Password*/);
  fireEvent.change(userInput, { target: { value: 'john@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'Qwerty1234!@#$' } });
  const submitButton = document.querySelector('button[type="submit"]');
  fireEvent.click(submitButton!);
};

const mockUserRequest = (userData = {}) => {
  return rest.get('*/v1/getUser', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(userData));
  });
};

const server = setupServer(
  ...handlers,
  mockUserRequest(),
  rest.post('*/v1/login', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json({ user: {} }));
  }),
  rest.get('*/v1/*', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Login', () => {
  it('Redirects to project page if user has no preferred project', async () => {
    renderPage('/login');
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent('Log in');
    await doLogin();
    server.use(mockUserRequest({ email: 'john@gmail.com', accessPolicy: [] }));

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Select project/i);
  });

  it('Redirects to landing page', async () => {
    renderPage('/login');
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent('Log in');

    server.use(mockUserRequest({ email: 'john@gmail.com', projectId: 'foo', accessPolicy: [] }));
    await doLogin();

    await screen.findByText(/Select survey/i);
  });

  it('Redirects back where it came from', async () => {
    renderPage('/survey');
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent('Log in');

    server.use(mockUserRequest({ email: 'john@gmail.com', projectId: 'foo', accessPolicy: [] }));
    await doLogin();

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Select survey/i);
  });
});
