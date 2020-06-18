/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  ConnectedTable,
  AlertMenuCell,
  CountryNameButtonCell,
  StartDateCell,
  WeekAndDateCell,
} from '../../components';

const createColumns = handleOpen => [
  {
    title: 'Country',
    key: 'name',
    width: '26%',
    align: 'left',
    CellComponent: CountryNameButtonCell(handleOpen),
  },
  {
    title: 'Diagnosis',
    key: 'diagnosis',
    align: 'left',
  },
  {
    title: 'Alert Start Date',
    key: 'week',
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

export const OutbreaksTable = React.memo(({ handleOpen }) => {
  return <ConnectedTable endpoint="outbreaks" columns={createColumns(handleOpen)} />;
});

OutbreaksTable.propTypes = {
  handleOpen: PropTypes.func.isRequired,
};
