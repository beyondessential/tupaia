/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  SyndromeCell,
  AlertMenuCell,
  CountryNameCell,
  WeekAndDateCell,
  StartDateCell,
} from '../../components';
import { ConnectedTable } from './ConnectedTable';

const createColumns = isForMultipleCountries => [
  ...(isForMultipleCountries
    ? [
        {
          title: 'Country',
          key: 'name',
          width: '25%',
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
  },
  {
    title: 'Outbreak Start Date',
    key: 'outbreakStartDate',
    align: 'left',
    CellComponent: StartDateCell,
  },
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
