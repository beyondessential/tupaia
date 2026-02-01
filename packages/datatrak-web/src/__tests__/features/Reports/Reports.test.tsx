import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import downloadjs from 'downloadjs';
import { renderComponent } from '../../helpers/render';
import { Reports } from '../../../features/Reports';

jest.mock('downloadjs', () => jest.fn());

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
  it('renders the Reports component without crashing', async () => {
    await renderComponent(<Reports />);
  });

  it('renders the surveys input', async () => {
    await renderComponent(<Reports />);
    const surveysInput = await screen.findByPlaceholderText('Select survey…');
    expect(surveysInput).toBeInTheDocument();
  });

  it('renders the entity level radio options', async () => {
    await renderComponent(<Reports />);
    const radioButtons = await screen.findAllByRole('radio');
    expect(radioButtons).toHaveLength(2);
    expect(radioButtons[0]).toHaveAttribute('value', 'country');
    expect(radioButtons[1]).toHaveAttribute('value', 'entity');
  });

  it('renders the country autocomplete input if entity level is country', async () => {
    await renderComponent(<Reports />);
    const radioButtons = await screen.findAllByRole('radio');
    await userEvent.click(radioButtons[0]);
    expect(screen.getByPlaceholderText('Select country...')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Select entities...')).not.toBeInTheDocument();
  });

  it('renders the entity autocomplete input if entity level is entity', async () => {
    await renderComponent(<Reports />);
    const radioButtons = await screen.findAllByRole('radio');
    await userEvent.click(radioButtons[1]);
    expect(screen.getByPlaceholderText('Select entities...')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Select country...')).not.toBeInTheDocument();
  });

  it('renders the start date input', async () => {
    await renderComponent(<Reports />);
    const startDateInput = await screen.findByLabelText('Start date');
    expect(startDateInput).toBeInTheDocument();
  });

  it('renders the end date input', async () => {
    await renderComponent(<Reports />);
    const endDateInput = await screen.findByLabelText('End date');
    expect(endDateInput).toBeInTheDocument();
  });

  it('Does not show an error message when form is submitted with startDate that is before endDate', async () => {
    await renderComponent(<Reports />);
    const startDateInput = await screen.findByLabelText('Start date');
    const endDateInput = await screen.findByLabelText('End date');
    const submitButton = await screen.findByRole('button', { name: 'Export' });

    await userEvent.type(startDateInput, '2021-01-01');
    await userEvent.type(endDateInput, '2022-01-01');
    await userEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.queryByText('Start date must be before end date')).not.toBeInTheDocument(),
    );
  });

  it('Does not show an error message when form is submitted with startDate and not an endDate', async () => {
    await renderComponent(<Reports />);
    const startDateInput = await screen.findByLabelText('Start date');
    const submitButton = await screen.findByRole('button', { name: 'Export' });

    await userEvent.type(startDateInput, '2021-01-01');
    await userEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.queryByText('Start date must be before end date')).not.toBeInTheDocument(),
    );
  });

  it('Does not show an error message when form is submitted with endDate and not a startDate', async () => {
    await renderComponent(<Reports />);
    const endDateInput = await screen.findByLabelText('End date');
    const submitButton = await screen.findByRole('button', { name: 'Export' });

    await userEvent.type(endDateInput, '2021-01-01');
    await userEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.queryByText('Start date must be before end date')).not.toBeInTheDocument(),
    );
  });

  it('Shows an error message when form is submitted with startDate that is after endDate', async () => {
    await renderComponent(<Reports />);

    const startDateInput = await screen.findByLabelText('Start date');
    const endDateInput = await screen.findByLabelText('End date');
    const submitButton = await screen.findByRole('button', { name: 'Export' });

    await userEvent.type(startDateInput, '2021-01-01');
    await userEvent.type(endDateInput, '2020-01-01');
    await userEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.queryByText('Start date must be before end date')).toBeInTheDocument(),
    );
  });

  it('Shows an error message when form is submitted without required fields filled in', async () => {
    await renderComponent(<Reports />);

    const submitButton = await screen.findByRole('button', { name: 'Export' });

    await userEvent.click(submitButton);
    await waitFor(() => expect(screen.getAllByText('Required')).toHaveLength(2));
  });

  it('Shows a message when the email timeout is hit in the request', async () => {
    server.use(
      rest.get('*/v1/export/surveyResponses', (_, res, ctx) => {
        return res(
          ctx.status(202),
          // mock the response from the server to be a json object with the key emailTimeoutHit
          ctx.json({ emailTimeoutHit: true }),
        );
      }),
    );
    await renderComponent(<Reports />);
    await userEvent.click(await screen.findByPlaceholderText('Select survey…'));
    await userEvent.click(await screen.findByText('Basic clinic data - Demo Land'));
    await userEvent.click(await screen.findByLabelText('Country'));
    await userEvent.click(await screen.getByPlaceholderText('Select country...'));
    await userEvent.click(await screen.findByText('Demo Land'));

    const submitButton = await screen.findByRole('button', { name: 'Export' });

    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(
          'This export is taking a while, and will continue in the background. You will be emailed when the export process completes.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('Downloads the file when the response is a blob', async () => {
    const file = new Blob(['test'], { type: 'text/csv' });
    server.use(
      rest.get('*/v1/export/surveyResponses', (_, res, ctx) => {
        return res(
          ctx.status(202),
          ctx.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="surveyResponses.csv"',
          }),
          ctx.body(file),
        );
      }),
    );
    await renderComponent(<Reports />);
    await userEvent.click(await screen.findByPlaceholderText('Select survey…'));
    await userEvent.click(await screen.findByText('Basic clinic data - Demo Land'));
    await userEvent.click(await screen.findByLabelText('Country'));
    await userEvent.click(await screen.getByPlaceholderText('Select country...'));
    await userEvent.click(await screen.findByText('Demo Land'));

    const submitButton = await screen.findByRole('button', { name: 'Export' });

    await userEvent.click(submitButton);
    expect(
      screen.queryByText(
        'This export is taking a while, and will continue in the background. You will be emailed when the export process completes.',
      ),
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(downloadjs).toHaveBeenCalledWith(file, 'surveyResponses.csv', 'text/csv'),
    );
  });

  it('Does not attempt to download the file if an error is caught', async () => {
    server.use(
      rest.get('*/v1/export/surveyResponses', (_, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Something went wrong' }));
      }),
    );
    await renderComponent(<Reports />);
    await userEvent.click(await screen.findByPlaceholderText('Select survey…'));
    await userEvent.click(await screen.findByText('Basic clinic data - Demo Land'));
    await userEvent.click(await screen.findByLabelText('Country'));
    await userEvent.click(await screen.getByPlaceholderText('Select country...'));
    await userEvent.click(await screen.findByText('Demo Land'));

    const submitButton = await screen.findByRole('button', { name: 'Export' });

    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.queryByText(
          'This export is taking a while, and will continue in the background. You will be emailed when the export process completes.',
        ),
      ).not.toBeInTheDocument();

      expect(downloadjs).not.toHaveBeenCalled();
    });
  });
});
