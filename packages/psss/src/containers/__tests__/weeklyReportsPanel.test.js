/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { screen, within, fireEvent } from '@testing-library/react';
import { WeeklyReportsPanel } from '../Panels';
import sitesData from './fixtures/sites.fixtures.json';
import countryData from './fixtures/country.fixtures.json';
import { render } from '../../utils/test-utils';

const ACTIVE_ID = 0;

const defaultState = {
  auth: {},
  weeklyReports: {
    site: {
      data: sitesData,
      status: 'idle',
      error: null,
      fetchStartedAt: null,
    },
    country: {
      data: countryData,
      status: 'idle',
      error: null,
      fetchStartedAt: null,
    },
    activeWeek: {
      id: ACTIVE_ID,
      panelIsOpen: true,
      verifiedStatuses: {
        afr: null,
        dia: false,
        ili: null,
        pf: null,
        dil: null,
      },
    },
  },
};

// Mock out the button select to just take and set an index
// Assume it has been unit tested elsewhere
jest.mock('@tupaia/ui-components', () => ({
  ...jest.requireActual('@tupaia/ui-components'),
  // eslint-disable-next-line react/prop-types
  ButtonSelect: ({ onChange }) => {
    function handleChange(event) {
      onChange(event.target.value);
    }
    return <input data-testid="select" onChange={handleChange} />;
  },
}));

function renderWeeklyReportsPanel() {
  render(<WeeklyReportsPanel />, defaultState);
  const countryReports = screen.getByTestId('country-reports');
  const inCountryReports = within(countryReports);

  const siteReports = screen.getByTestId('site-reports');
  const inSiteReports = within(siteReports);

  return {
    inCountryReports,
    inSiteReports,
  };
}

describe('weekly reports panel', () => {
  it('renders country syndromes data', () => {
    const { inCountryReports } = renderWeeklyReportsPanel();
    const syndromes = countryData[ACTIVE_ID].syndromes;

    syndromes.forEach(({ title, totalCases }) => {
      const row = inCountryReports.getByText(title).closest('tr');
      const inRow = within(row);
      expect(inRow.getByText(title)).toBeInTheDocument();
      expect(inRow.getByDisplayValue(totalCases.toString())).toBeInTheDocument();
    });
  });

  it('renders site syndromes data', () => {
    const FIRST_SITE_INDEX = 0;
    const { inSiteReports } = renderWeeklyReportsPanel();

    const syndromes = sitesData[FIRST_SITE_INDEX].syndromes;
    syndromes.forEach(({ title, totalCases }) => {
      const row = inSiteReports.getByText(title).closest('tr');
      const inRow = within(row);
      expect(inRow.getByText(title)).toBeInTheDocument();
      expect(inRow.getByDisplayValue(totalCases.toString())).toBeInTheDocument();
    });
  });

  it('can render data by site', () => {
    const FIRST_SITE_INDEX = 0;
    const SECOND_SITE_INDEX = 1;
    const { inSiteReports } = renderWeeklyReportsPanel();
    const firstSite = sitesData[FIRST_SITE_INDEX];
    const secondSite = sitesData[SECOND_SITE_INDEX];

    expect(inSiteReports.getByText(firstSite.address.name)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('select'), {
      target: { value: SECOND_SITE_INDEX },
    });

    expect(screen.getByText(secondSite.address.name)).toBeInTheDocument();
    const syndromes = sitesData[SECOND_SITE_INDEX].syndromes;
    syndromes.forEach(({ title, totalCases }) => {
      const row = inSiteReports.getByText(title).closest('tr');
      const inRow = within(row);
      expect(inRow.getByText(title)).toBeInTheDocument();
      expect(inRow.getByDisplayValue(totalCases.toString())).toBeInTheDocument();
    });
  });

  it('displays un-verified alerts', () => {
    const { inCountryReports } = renderWeeklyReportsPanel();
    expect(inCountryReports.getByRole('button', { name: /please verify*/i })).toBeInTheDocument();
  });

  it('validates un-verified alerts', () => {
    renderWeeklyReportsPanel();
    const submitButton = screen.getByRole('button', { name: /submit*/i });
    fireEvent.click(submitButton);
    const alerts = screen.getAllByText(/please review*/i);
    expect(alerts.length).toEqual(2);
    expect(submitButton).toBeDisabled();
  });
});
