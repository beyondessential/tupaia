/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render } from 'test-utils';
import { screen, within, fireEvent } from '@testing-library/react';
import { WeeklyReportPanelComponent } from '../WeeklyReportPanel';
import sitesData from './fixtures/sites.fixtures.json';
import countryData from './fixtures/country.fixtures.json';

const props = {
  countryData: countryData[0].syndromes,
  sitesData,
  isOpen: true,
  handleClose: () => {
    console.log('close');
  },
  handleConfirm: () => {
    console.log('confirm');
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

function renderWeeklyReportPanel() {
  render(
    <WeeklyReportPanelComponent
      countryData={props.countryData}
      sitesData={props.sitesData}
      isOpen={props.isOpen}
      handleClose={props.handleClose}
      handleConfirm={props.handleConfirm}
    />,
  );
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
    const { inCountryReports } = renderWeeklyReportPanel();
    const syndromes = props.countryData;

    syndromes.forEach(({ title, totalCases }) => {
      const row = inCountryReports.getByText(title).closest('tr');
      const inRow = within(row);
      expect(inRow.getByText(title)).toBeInTheDocument();
      expect(inRow.getByDisplayValue(totalCases.toString())).toBeInTheDocument();
    });
  });

  it('renders site syndromes data', () => {
    const FIRST_SITE_INDEX = 0;
    const { inSiteReports } = renderWeeklyReportPanel();

    const syndromes = props.sitesData[FIRST_SITE_INDEX].syndromes;
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
    const { inSiteReports } = renderWeeklyReportPanel();
    const firstSite = props.sitesData[FIRST_SITE_INDEX];
    const secondSite = props.sitesData[SECOND_SITE_INDEX];

    expect(inSiteReports.getByText(firstSite.address.name)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('select'), {
      target: { value: SECOND_SITE_INDEX },
    });

    expect(screen.getByText(secondSite.address.name)).toBeInTheDocument();
    const syndromes = props.sitesData[SECOND_SITE_INDEX].syndromes;
    syndromes.forEach(({ title, totalCases }) => {
      const row = inSiteReports.getByText(title).closest('tr');
      const inRow = within(row);
      expect(inRow.getByText(title)).toBeInTheDocument();
      expect(inRow.getByDisplayValue(totalCases.toString())).toBeInTheDocument();
    });
  });
});
