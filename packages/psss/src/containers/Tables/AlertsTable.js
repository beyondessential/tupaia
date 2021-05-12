/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from '@tupaia/ui-components';
import {
  AlertMenuCell,
  CountryNameLinkCell,
  SyndromeCell,
  WeekAndDateCell,
} from '../../components';
import { useActiveAlerts } from '../../api';
import { getCountryCodes } from '../../store';

const countryColumn = {
  title: 'Country',
  key: 'countryCode',
  width: '28%',
  align: 'left',
  CellComponent: CountryNameLinkCell,
};

const alertColumns = [
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

const getColumns = isSingleCountry =>
  isSingleCountry ? alertColumns : [countryColumn, ...alertColumns];

const AlertsTableComponent = React.memo(({ onRowClick, countryCode, countryCodes, period }) => {
  const isSingleCountry = !!countryCode;
  const orgUnitCodes = isSingleCountry ? [countryCode] : countryCodes;
  const columns = getColumns(isSingleCountry);
  const { data, isLoading, error, isFetching } = useActiveAlerts(period, orgUnitCodes);

  const handleRowClick = useCallback(
    (_, rowData) => {
      onRowClick(rowData);
    },
    [onRowClick],
  );

  return (
    <Table
      data={data}
      isLoading={isLoading}
      isFetching={!isLoading && isFetching}
      errorMessage={error && error.message}
      columns={columns}
      onRowClick={handleRowClick}
    />
  );
});

AlertsTableComponent.propTypes = {
  countryCode: PropTypes.string,
  countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  period: PropTypes.string.isRequired,
  onRowClick: PropTypes.func.isRequired,
};

AlertsTableComponent.defaultProps = {
  countryCode: '',
};

const mapStateToProps = state => ({
  countryCodes: getCountryCodes(state),
});

export const AlertsTable = connect(mapStateToProps)(AlertsTableComponent);
