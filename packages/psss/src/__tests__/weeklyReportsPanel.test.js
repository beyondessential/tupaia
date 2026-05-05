import React from 'react';
import { keyBy } from 'es-toolkit/compat';
import { screen, within, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import confirmedReport from './fixtures/confirmedReport.json';
import unConfirmedReport from './fixtures/unConfirmedReport.json';
import { WeeklyReportsPanelComponent } from '../containers';
import { SYNDROMES } from '../constants';
import { render } from '../utils/test-utils';

// Mock API Requests
const server = setupServer(
  rest.get('*/weeklyReport/*', (req, res, ctx) => {
    return res(ctx.json(unConfirmedReport));
  }),

  rest.get('*/confirmedWeeklyReport/*', (req, res, ctx) => {
    return res(ctx.json(confirmedReport));
  }),
);

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

function renderWeeklyReportsPanel() {
  const history = createMemoryHistory({ initialEntries: ['/weekly-reports/TO'] });

  render(
    <Router history={history}>
      <Route path="/weekly-reports/:countryCode">
        <WeeklyReportsPanelComponent
          isOpen
          handleClose={() => console.log('close...')}
          activeWeek="2019W51"
          verifiedStatuses={[]}
        />
      </Route>
    </Router>,
  );

  const countryReports = screen.getByTestId('country-reports');

  const inCountryReports = within(countryReports);

  return {
    inCountryReports,
  };
}

describe('weekly reports panel', () => {
  const reportsByPeriod = keyBy(unConfirmedReport.data.results, 'period');

  it('renders country syndromes data', async () => {
    const report = reportsByPeriod['2019W51'];
    const { inCountryReports } = renderWeeklyReportsPanel();

    await waitForElementToBeRemoved(() => screen.queryByText(/loading*/i));

    for (const [syndromeKey, syndromeTitle] of Object.entries(SYNDROMES)) {
      const row = inCountryReports.getByText(syndromeTitle).closest('tr');
      expect(within(row).getByDisplayValue(report[syndromeKey].toString())).toBeInTheDocument();
    }
  });

  it('displays un-verified alerts', () => {
    const { inCountryReports } = renderWeeklyReportsPanel();
    expect(inCountryReports.getByRole('button', { name: /click to verify*/i })).toBeInTheDocument();
  });

  it('validates un-verified alerts', () => {
    renderWeeklyReportsPanel();
    const submitButton = screen.getByRole('button', { name: /confirm*/i });
    fireEvent.click(submitButton);
    const alerts = screen.getAllByText(/please review*/i);
    expect(alerts.length).toEqual(1);
    expect(submitButton).toBeDisabled();
  });
});
