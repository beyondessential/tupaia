/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from '@tupaia/ui-components';
import { SyndromeCell, AlertMenuCell, WeekAndDateCell, CountryNameCell } from '../../components';
import { useTableQuery } from '../../api';

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

export const AlertsTable = React.memo(({ handlePanelOpen, countryCode }) => {
  const { isLoading, isFetching, error, data, order, orderBy, handleChangeOrderBy } = useTableQuery(
    'alerts',
  );

  return (
    <>
      <Table
        order={order}
        orderBy={orderBy}
        onChangeOrderBy={handleChangeOrderBy}
        data={data ? data.data : 0}
        count={data ? data.count : 0}
        isLoading={isLoading}
        errorMessage={error && error.message}
        columns={createColumns(!countryCode)}
        onRowClick={handlePanelOpen}
      />
      {isFetching && 'Fetching...'}
    </>
  );
});

AlertsTable.propTypes = {
  handlePanelOpen: PropTypes.func.isRequired,
  countryCode: PropTypes.string,
};

AlertsTable.defaultProps = {
  countryCode: null,
};
