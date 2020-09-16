/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  SyndromeCell,
  AlertMenuCell,
  CountryNameButtonCreator,
  WeekAndDateCell,
} from '../../components';
import { ConnectedTable } from './ConnectedTable';

const createColumns = handlePanelOpen => [
  {
    title: 'Country',
    key: 'name',
    width: '28%',
    align: 'left',
    CellComponent: CountryNameButtonCreator(handlePanelOpen),
  },
  {
    title: 'Syndrome',
    key: 'syndrome',
    align: 'left',
    CellComponent: SyndromeCell,
  },
  {
    title: 'Alert Start Date',
    key: 'weekNumber',
    align: 'left',
    width: '180px',
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
    width: '50px',
  },
];

export const AlertsTable = React.memo(({ handlePanelOpen }) => (
  <ConnectedTable endpoint="alerts" columns={createColumns(handlePanelOpen)} />
));

AlertsTable.propTypes = {
  handlePanelOpen: PropTypes.func.isRequired,
};
