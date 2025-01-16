import { Table } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import React from 'react';
import { useAlerts } from '../../api';
import { AlertMenuCell, SyndromeCell, WeekAndDateCell } from '../../components';
import { getCurrentPeriod } from '../../utils';

const columns = [
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
    title: '',
    key: 'id',
    sortable: false,
    CellComponent: AlertMenuCell,
    width: '45px',
  },
];

export const FakeEventBasedDataTable = ({ countryCode }) => {
  const period = getCurrentPeriod();
  const { data, isLoading, error, isFetching } = useAlerts(period, [countryCode], 'active');

  return (
    <Table
      data={data}
      isLoading={isLoading}
      isFetching={!isLoading && isFetching}
      errorMessage={error && error.message}
      columns={columns}
    />
  );
};

FakeEventBasedDataTable.propTypes = {
  countryCode: PropTypes.string.isRequired,
};
