/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  ConnectedTable,
  SyndromeCell,
  AlertMenuCell,
  CountryNameButtonCreator,
  WeekAndDateCell,
} from '../../components';
import { checkIsRegionalUser } from '../../store';

const createColumns = (isRegionalUser, handlePanelOpen) => [
  ...(isRegionalUser
    ? [
        {
          title: 'Country',
          key: 'name',
          width: '28%',
          align: 'left',
          CellComponent: CountryNameButtonCreator(handlePanelOpen),
        },
      ]
    : []),
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

export const AlertsTableComponent = React.memo(({ handlePanelOpen, isRegionalUser }) => (
  <ConnectedTable endpoint="alerts" columns={createColumns(isRegionalUser, handlePanelOpen)} />
));

AlertsTableComponent.propTypes = {
  handlePanelOpen: PropTypes.func.isRequired,
  isRegionalUser: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isRegionalUser: checkIsRegionalUser(state),
});

export const AlertsTable = connect(mapStateToProps)(AlertsTableComponent);
