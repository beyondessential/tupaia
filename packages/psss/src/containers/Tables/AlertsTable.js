/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { SyndromeCell, AlertMenuCell, WeekAndDateCell, CountryNameCell } from '../../components';
import { ConnectedTable } from './ConnectedTable';
import { getEntitiesAllowed } from '../../store';
import { connect } from 'react-redux';

const createColumns = isForMultipleCountries => [
  ...(isForMultipleCountries
    ? [
        {
          title: 'Country',
          key: 'name',
          width: '28%',
          align: 'left',
          CellComponent: CountryNameCell,
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

const AlertsTableComponent = React.memo(({ handlePanelOpen, countryCode, allowedEntities }) => (
  <ConnectedTable
    endpoint="alerts"
    fetchOptions={{ countries: allowedEntities }} // this may not be needed when the api is complete but is needed for app testing in the meantime
    columns={createColumns(!countryCode)}
    onRowClick={handlePanelOpen}
  />
));

AlertsTableComponent.propTypes = {
  handlePanelOpen: PropTypes.func.isRequired,
  countryCode: PropTypes.string,
  allowedEntities: PropTypes.array,
};

AlertsTableComponent.defaultProps = {
  countryCode: null,
  allowedEntities: [],
};

const mapStateToProps = state => ({
  allowedEntities: getEntitiesAllowed(state),
});

export const AlertsTable = connect(mapStateToProps)(AlertsTableComponent);
