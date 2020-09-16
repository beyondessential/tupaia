/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  AlertMenuCell,
  CountryNameButtonCreator,
  StartDateCell,
  WeekAndDateCell,
} from '../../components';
import { ConnectedTable } from './ConnectedTable';

const createColumns = (isForMultipleCountries, handlePanelOpen) => [
  ...(isForMultipleCountries
    ? [
        {
          title: 'Country',
          key: 'name',
          width: '26%',
          align: 'left',
          CellComponent: CountryNameButtonCreator(handlePanelOpen),
        },
      ]
    : []),
  {
    title: 'Diagnosis',
    key: 'diagnosis',
    align: 'left',
  },
  {
    title: 'Alert Start Date',
    key: 'weekNumber',
    align: 'left',
    width: '220px',
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Outbreak Start Date',
    key: 'outbreakStartDate',
    align: 'left',
    CellComponent: StartDateCell,
  },
  {
    title: 'Cases Since Alert Began',
    key: 'totalCases',
    align: 'left',
    width: '125px',
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

export const OutbreaksTable = React.memo(({ handlePanelOpen, countryCode }) => {
  return (
    <ConnectedTable endpoint="outbreaks" columns={createColumns(!countryCode, handlePanelOpen)} />
  );
});

OutbreaksTable.propTypes = {
  handlePanelOpen: PropTypes.func.isRequired,
  countryCode: PropTypes.string,
};

OutbreaksTable.defaultProps = {
  countryCode: null,
};
