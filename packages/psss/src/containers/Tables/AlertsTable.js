/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from '@tupaia/ui-components';
import { AlertMenuCell, CountryLinkCell, SyndromeCell, WeekAndDateCell } from '../../components';
import { useAlerts } from '../../api';
import { getCountryCodes } from '../../store';

/* eslint-disable react/prop-types */
const ActiveAlertCountryCell = ({ organisationUnit }) => (
  <CountryLinkCell target={`alerts/${organisationUnit}`} countryCode={organisationUnit} />
);

const ArchivedAlertCountryCell = ({ organisationUnit }) => (
  <CountryLinkCell target={`alerts/archive/${organisationUnit}`} countryCode={organisationUnit} />
);
/* eslint-enable react/prop-types */

const getCountryColumn = alertStatus => ({
  title: 'Country',
  key: 'organisationUnit',
  width: '28%',
  align: 'left',
  CellComponent: alertStatus === 'archived' ? ArchivedAlertCountryCell : ActiveAlertCountryCell,
});

const activeColumns = [
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

const archivedColumns = [
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
  // {
  //   title: 'Outbreak Start Date',
  //   key: 'outbreakStartDate',
  //   align: 'left',
  //   CellComponent: StartDateCell,
  // },
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
    width: '45px',
  },
];

const getColumns = (alertStatus, isSingleCountry) => {
  const baseColumns = alertStatus === 'archived' ? archivedColumns : activeColumns;
  return isSingleCountry ? baseColumns : [getCountryColumn(), ...baseColumns];
};

const AlertsTableComponent = React.memo(({ countryCodes, period, alertStatus }) => {
  const { countryCode } = useParams();
  const isSingleCountry = !!countryCode;
  const orgUnitCodes = isSingleCountry ? [countryCode] : countryCodes;
  const columns = getColumns(alertStatus, isSingleCountry);
  const { data, isLoading, error, isFetching } = useAlerts(period, orgUnitCodes, alertStatus);

  return (
    <Table
      data={data}
      isLoading={isLoading}
      isFetching={!isLoading && isFetching}
      errorMessage={error && error.message}
      columns={columns}
    />
  );
});

AlertsTableComponent.propTypes = {
  countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  period: PropTypes.string.isRequired,
  alertStatus: PropTypes.oneOf(['active', 'archived']).isRequired,
};

const mapStateToProps = state => ({
  countryCodes: getCountryCodes(state),
});

export const AlertsTable = connect(mapStateToProps)(AlertsTableComponent);
