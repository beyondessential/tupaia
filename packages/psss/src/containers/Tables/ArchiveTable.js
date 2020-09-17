/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  ConnectedTable,
  SyndromeCell,
  AlertMenuCell,
  CountryNameCell,
  WeekAndDateCell,
  StartDateCell,
} from '../../components';

const createColumns = isForMultipleCountries => [
  ...(isForMultipleCountries
    ? [
        {
          title: 'Country',
          key: 'name',
          width: '22%',
          align: 'left',
          CellComponent: CountryNameCell,
        },
      ]
    : []),
  {
    title: 'Syndrome',
    key: 'syndrome',
    align: 'left',
    width: '100px',
    CellComponent: SyndromeCell,
  },
  {
    title: 'Alert Start Date',
    key: 'weekNumber',
    align: 'left',
    width: '220px',
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Cases Since Alert Began',
    key: 'totalCases',
    align: 'left',
    width: '125px',
  },
  {
    title: 'Outbreak Start Date',
    key: 'outbreakStartDate',
    align: 'left',
    width: '120px',
    CellComponent: StartDateCell,
  },
  {
    title: 'Diagnosis',
    key: 'diagnosis',
    align: 'left',
  },
  {
    title: 'Total Lab Confirmed Cases',
    key: 'totalLabCases',
    align: 'left',
    width: '140px',
  },
  {
    title: '',
    key: 'id',
    sortable: false,
    CellComponent: AlertMenuCell,
    width: '70px',
  },
];

export const ArchiveTable = React.memo(({ countryCode }) => (
  <ConnectedTable endpoint="archive" columns={createColumns(!countryCode)} />
));

ArchiveTable.propTypes = {
  countryCode: PropTypes.string,
};

ArchiveTable.defaultProps = {
  countryCode: null,
};
