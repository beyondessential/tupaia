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
import { checkIsMultiCountryUser, getActiveEntity } from '../../store';

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

export const AlertsTableComponent = React.memo(
  ({ handlePanelOpen, isRegionalUser, activeEntity }) => (
    // Todo: user activeEntity to filter alerts
    <ConnectedTable endpoint="alerts" columns={createColumns(isRegionalUser, handlePanelOpen)} />
  ),
);

AlertsTableComponent.propTypes = {
  handlePanelOpen: PropTypes.func.isRequired,
  isRegionalUser: PropTypes.bool.isRequired,
  activeEntity: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  isRegionalUser: checkIsMultiCountryUser(state),
  activeEntity: getActiveEntity(state),
});

export const AlertsTable = connect(mapStateToProps)(AlertsTableComponent);
