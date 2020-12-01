/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ExpandableTable, ExpandableTableBody } from '@tupaia/ui-components';
import { connect } from 'react-redux';
import { COLUMN_WIDTHS } from './constants';
import { CountrySummaryTable } from './CountrySummaryTable';
import { useTableQuery } from '../../api';
import {
  createTotalCasesAccessor,
  AlertCell,
  SitesReportedCell,
  CountryNameLinkCell,
} from '../../components';
import { getEntitiesAllowed } from '../../store';

const countriesTableColumns = [
  {
    title: 'Country',
    key: 'name',
    width: '30%', // must be same as CountrySummaryTable name column to align
    align: 'left',
    CellComponent: CountryNameLinkCell,
  },
  {
    title: 'Site Reported',
    key: 'sitesReported',
    CellComponent: SitesReportedCell,
    width: COLUMN_WIDTHS.SITES_REPORTED,
  },
  {
    title: 'AFR',
    key: 'AFR',
    accessor: createTotalCasesAccessor('afr'),
    CellComponent: AlertCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
    accessor: createTotalCasesAccessor('dia'),
    CellComponent: AlertCell,
  },
  {
    title: 'ILI',
    key: 'ILI',
    accessor: createTotalCasesAccessor('ili'),
    CellComponent: AlertCell,
  },
  {
    title: 'PF',
    key: 'PF',
    accessor: createTotalCasesAccessor('pf'),
    CellComponent: AlertCell,
  },
  {
    title: 'DLI',
    key: 'DLI',
    accessor: createTotalCasesAccessor('dli'),
    CellComponent: AlertCell,
  },
];

export const CountriesTableComponent = ({ allowedEntities }) => {
  const { isLoading, isFetching, error, data, order, orderBy, handleChangeOrderBy } = useTableQuery(
    'countries',
    {
      countries: allowedEntities,
    },
  );

  return (
    <>
      <ExpandableTable
        order={order}
        orderBy={orderBy}
        onChangeOrderBy={handleChangeOrderBy}
        data={data ? data.data : 0}
        count={data ? data.count : 0}
        isLoading={isLoading}
        errorMessage={error && error.message}
        columns={countriesTableColumns}
        Body={ExpandableTableBody}
        SubComponent={CountrySummaryTable}
      />
      {isFetching && 'Fetching...'}
    </>
  );
};

CountriesTableComponent.propTypes = {
  allowedEntities: PropTypes.array,
};

CountriesTableComponent.defaultProps = {
  allowedEntities: [],
};

const mapStateToProps = state => ({
  allowedEntities: getEntitiesAllowed(state),
});

export const CountriesTable = connect(mapStateToProps)(CountriesTableComponent);
