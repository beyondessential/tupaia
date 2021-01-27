/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import keyBy from 'lodash.keyby';
import { screen, within, waitForElementToBeRemoved } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import confirmedReport from './fixtures/confirmedReport.json';
import unConfirmedReport from './fixtures/unConfirmedReport.json';
import { WeeklyReportsPanelComponent } from '../containers';
import { SYNDROMES } from '../constants';
import { render } from '../utils/test-utils';
import unconfirmedData from './fixtures/unConfirmedReport.json';

const ACTIVE_ID = 0;

const defaultState = {
  auth: {},
  weeklyReports: {
    latestViewableWeek: '2020W50',
    activeWeek: '2020W50',
    panelIsOpen: false,
    verifiedStatuses: [],
  },
};

// declare which API requests to mock
const server = setupServer(
  // capture "GET /weeklyReport" requests
  rest.get('*/weeklyReport/*', (req, res, ctx) => {
    return res(ctx.json(unConfirmedReport));
  }),

  rest.get('*/confirmedWeeklyReport/*', (req, res, ctx) => {
    return res(ctx.json(confirmedReport));
  }),
);

// establish API mocking before all tests
beforeAll(() => server.listen());
// reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());
// clean up once the tests are done
afterAll(() => server.close());

function renderWeeklyReportsPanel() {
  const history = createMemoryHistory({ initialEntries: ['/weekly-reports/TO'] });
  const myElement = render(
    <Router history={history}>
      <Route path="/weekly-reports/:countryCode">
        <WeeklyReportsPanelComponent
          isOpen={true}
          handleClose={() => console.log('close...')}
          activeWeek="2019W51"
          verifiedStatuses={[]}
        />
      </Route>
    </Router>,
    defaultState,
  );
  // myElement.debug();
  // return true;
  const countryReports = screen.getByTestId('country-reports');
  const inCountryReports = within(countryReports);

  return {
    inCountryReports,
  };
}

describe('weekly reports panel', () => {
  const reportsByPeriod = keyBy(unconfirmedData.data.results, 'period');

  it('renders country syndromes data', async () => {
    const report = reportsByPeriod['2019W51'];
    const { inCountryReports } = renderWeeklyReportsPanel();

    await waitForElementToBeRemoved(() => screen.queryByText(/loading*/i));

    for (let [syndromeKey, syndromeTitle] of Object.entries(SYNDROMES)) {
      const row = inCountryReports.getByText(syndromeTitle).closest('tr');
      expect(within(row).getByDisplayValue(report[syndromeKey].toString())).toBeInTheDocument();
    }
  });
  //
  // it('renders site syndromes data', () => {
  //   const FIRST_SITE_INDEX = 0;
  //   const { inSiteReports } = renderWeeklyReportsPanel();
  //
  //   const { syndromes } = sitesData[FIRST_SITE_INDEX];
  //   syndromes.forEach(({ title, totalCases }) => {
  //     const row = inSiteReports.getByText(title).closest('tr');
  //     const inRow = within(row);
  //     expect(inRow.getByText(title)).toBeInTheDocument();
  //     expect(inRow.getByDisplayValue(totalCases.toString())).toBeInTheDocument();
  //   });
  // });

  // it('can render data by site', () => {
  //   const FIRST_SITE_INDEX = 0;
  //   const SECOND_SITE_INDEX = 1;
  //   const { inSiteReports } = renderWeeklyReportsPanel();
  //   const firstSite = sitesData[FIRST_SITE_INDEX];
  //   const secondSite = sitesData[SECOND_SITE_INDEX];
  //
  //   expect(inSiteReports.getByText(firstSite.address.name)).toBeInTheDocument();
  //
  //   fireEvent.change(screen.getByTestId('select'), {
  //     target: { value: SECOND_SITE_INDEX },
  //   });
  //
  //   expect(screen.getByText(secondSite.address.name)).toBeInTheDocument();
  //   const { syndromes } = sitesData[SECOND_SITE_INDEX];
  //   syndromes.forEach(({ title, totalCases }) => {
  //     const row = inSiteReports.getByText(title).closest('tr');
  //     const inRow = within(row);
  //     expect(inRow.getByText(title)).toBeInTheDocument();
  //     expect(inRow.getByDisplayValue(totalCases.toString())).toBeInTheDocument();
  //   });
  // });

  // it('displays un-verified alerts', () => {
  //   const { inCountryReports } = renderWeeklyReportsPanel();
  //   expect(inCountryReports.getByRole('button', { name: /click to verify*/i })).toBeInTheDocument();
  // });

  // it('validates un-verified alerts', () => {
  //   renderWeeklyReportsPanel();
  //   const submitButton = screen.getByRole('button', { name: /submit*/i });
  //   fireEvent.click(submitButton);
  //   const alerts = screen.getAllByText(/please review*/i);
  //   expect(alerts.length).toEqual(2);
  //   expect(submitButton).toBeDisabled();
  // });
});
