import '../../mocks/matchMedia.mock'; // Import before components under test

import { fireEvent, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderSurveyPage } from '../../helpers/render';
import { handlers } from '../../mocks/handlers';

const server = setupServer(
  ...handlers,
  rest.get('*/v1/getUser', (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ name: 'John Smith', email: 'john@gmail.com', id: '0'.repeat(24) }),
    );
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const writeText = jest.fn();

Object.assign(navigator, {
  clipboard: {
    writeText,
  },
});

describe('Copy Survey URL Button', () => {
  it('copies a survey url from a survey screen', async () => {
    renderSurveyPage('/survey/DL/test/1');

    await screen.findByRole('heading', { level: 1 });

    fireEvent.click(screen.getByRole('button', { name: /copy*/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringMatching(/survey\/DL\/test/),
    );
  });

  it('copies a survey url from the review screen', async () => {
    renderSurveyPage('/survey/DL/test/review');

    await screen.findByRole('heading', { level: 1 });

    fireEvent.click(screen.getByRole('button', { name: /copy*/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringMatching(/survey\/DL\/test/),
    );
  });
});
