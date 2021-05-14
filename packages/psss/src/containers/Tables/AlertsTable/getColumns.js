/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  AlertMenuCell,
  CountryLinkCell,
  StartDateCell,
  SyndromeCell,
  WeekAndDateCell,
} from '../../../components';

const createCountryColumn = alertCategory => {
  const CellComponent = ({ organisationUnit }) => (
    <CountryLinkCell
      target={`/alerts/${alertCategory}/${organisationUnit}`}
      countryCode={organisationUnit}
    />
  );
  CellComponent.propTypes = {
    organisationUnit: PropTypes.string.isRequired,
  };

  return {
    title: 'Country',
    key: 'organisationUnit',
    width: '28%',
    align: 'left',
    CellComponent,
  };
};

const activeColumns = [
  {
    title: 'Syndrome',
    key: 'syndrome',
    align: 'left',
    CellComponent: SyndromeCell,
  },
  {
    title: 'Alert Start Date',
    key: 'period',
    align: 'left',
    width: '200px',
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Cases Since Alert Began',
    key: 'totalCases',
    align: 'left',
    width: '115px',
  },
  {
    title: 'Sites Reported',
    key: 'sitesReported',
    align: 'left',
  },
  {
    title: '',
    key: 'id',
    sortable: false,
    CellComponent: AlertMenuCell,
    width: '45px',
  },
];

const archiveColumns = [
  {
    title: 'Syndrome',
    key: 'syndrome',
    align: 'left',
    CellComponent: SyndromeCell,
  },
  {
    title: 'Alert Start Date',
    key: 'period',
    align: 'left',
    width: '200px',
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Cases Since Alert Began',
    key: 'totalCases',
    align: 'left',
    width: '115px',
  },
  // {
  //   title: 'Outbreak Start Date',
  //   key: 'outbreakStartDate',
  //   align: 'left',
  //   CellComponent: StartDateCell,
  // },
  {
    title: 'Diagnosis',
    key: 'diagnosis',
    align: 'left',
  },
  {
    title: '',
    key: 'id',
    sortable: false,
    CellComponent: AlertMenuCell,
    width: '45px',
  },
];

const COLUMNS_BY_CATEGORY = {
  active: activeColumns,
  archive: archiveColumns,
};

export const getColumns = ({ alertCategory, countryCode }) => {
  const baseColumns = COLUMNS_BY_CATEGORY[alertCategory];
  const isSingleCountry = !!countryCode;
  return isSingleCountry ? baseColumns : [createCountryColumn(alertCategory), ...baseColumns];
};
