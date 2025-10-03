import '../mocks/matchMedia.mock'; // Import before components under test

import { fireEvent, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderSurveyPage } from '../helpers/render';
import { handlers } from '../mocks/handlers';

const server = setupServer(
  ...handlers,
  rest.get('*/v1/getUser', (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        name: 'John Smith',
        email: 'john@gmail.com',
        id: '0'.repeat(24),
      }),
    );
  }),
  rest.get('*/v1/*', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Survey', () => {
  it('displays a survey screen', async () => {
    renderSurveyPage('/survey/DL/test/1');
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

  it('renders only visible questions when visibility criteria is applicable', async () => {
    renderSurveyPage('/survey/DL/test/7');
    // has 1 question to start with
    const radioGroup = await screen.findAllByRole('radiogroup');
    expect(radioGroup.length).toBe(1);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Is the facility open?');

    // after selecting 'permanently closed' option, the next question, 'why is the facility closed?' should appear
    fireEvent.click(screen.getByRole('radio', { name: /permanently closed*/i }));
    expect(screen.getAllByRole('radiogroup').length).toBe(2);
    expect(screen.getByText('Why is the facility closed?')).toBeInTheDocument();

    // after selecting 'permanently closed' option, the next question, 'why is the facility closed?' should appear
    fireEvent.click(screen.getByRole('radio', { name: /temporarily closed*/i }));
    expect(screen.getAllByRole('radiogroup').length).toBe(2);
    expect(screen.getByText('Why is the facility closed?')).toBeInTheDocument();

    // after selecting 'lack of staff' option, 2 more questions should appear
    fireEvent.click(screen.getByRole('radio', { name: /lack of staff*/i }));
    expect(screen.getByLabelText('How many staff do you have? *')).toBeInTheDocument();
    expect(screen.getByLabelText('How many staff do you need? *')).toBeInTheDocument();

    // change the answer to 'open' and the other 3 questions should disappear
    fireEvent.click(screen.getByRole('radio', { name: /open*/i }));
    expect(screen.getAllByRole('radiogroup').length).toBe(1);
  });

  it('updates the sidebar page list based on visible questions on a screen', async () => {
    renderSurveyPage('/survey/DL/test/7');
    // after selecting the 'open' option, the next page, 'does the facility have staff housing?' should appear in the menu and the submit button should be the 'next' button
    fireEvent.click(await screen.findByRole('radio', { name: /open*/i }));
    expect(screen.queryByText('Does the facility have staff housing?')).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('radio', { name: /temporarily*/i }));
    expect(screen.queryByText('Does the facility have staff housing?')).not.toBeInTheDocument();
  });

  it('Updates the condition question answer when the associated question is updated', async () => {
    renderSurveyPage('/survey/DL/test/8');
    const input = await screen.findByLabelText('Enter a number');
    fireEvent.change(input, { target: { value: '4' } });
    expect(screen.queryByDisplayValue('Result for > 3')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '2' } });
    expect(screen.queryByDisplayValue('Result for < 3')).toBeInTheDocument();
  });

  it('Updates the arithmetic question answer when the associated question is updated', async () => {
    renderSurveyPage('/survey/DL/test/8');
    const input = await screen.findByLabelText('Enter a number');
    fireEvent.change(input, { target: { value: '4' } });
    expect(screen.queryByDisplayValue('This is an answer, from (4 + 2): 6')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    expect(screen.queryByDisplayValue('This is an answer, from (0 + 1): 1')).toBeInTheDocument();
  });
});
