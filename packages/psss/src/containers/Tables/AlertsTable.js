/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import {
  ConnectedTable,
  SyndromeCell,
  AlertMenuCell,
  CountryNameButtonCreator,
  WeekAndDateCell,
} from '../../components';
import { openAlertsPanel } from '../../store';

const columns = [
  {
    title: 'Country',
    key: 'name',
    width: '28%',
    align: 'left',
    CellComponent: CountryNameButtonCreator(openAlertsPanel),
  },
  {
    title: 'Syndrome',
    key: 'syndrome',
    align: 'left',
    CellComponent: SyndromeCell,
  },
  {
    title: 'Alert Start Date',
    key: 'week',
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

export const AlertsTable = React.memo(() => <ConnectedTable endpoint="alerts" columns={columns} />);
