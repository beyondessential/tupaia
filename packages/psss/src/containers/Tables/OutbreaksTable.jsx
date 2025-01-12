import React from 'react';
import PropTypes from 'prop-types';
import { Table } from '@tupaia/ui-components';
import {
  AlertMenuCell,
  FakeCountryNameCell,
  StartDateCell,
  WeekAndDateCell,
} from '../../components';
import { useTableQuery } from '../../api';

const createColumns = isForMultipleCountries => [
  ...(isForMultipleCountries
    ? [
        {
          title: 'Country',
          key: 'organisationUnit',
          width: '26%',
          align: 'left',
          CellComponent: FakeCountryNameCell,
        },
      ]
    : []),
  {
    title: 'Diagnosis',
    key: 'diagnosis',
    align: 'left',
  },
  {
    title: 'Alert Start Date',
    key: 'weekNumber',
    align: 'left',
    width: '220px',
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Outbreak Start Date',
    key: 'outbreakStartDate',
    align: 'left',
    CellComponent: StartDateCell,
  },
  {
    title: 'Cases Since Alert Began',
    key: 'totalCases',
    align: 'left',
    width: '125px',
  },
  {
    title: '',
    key: 'id',
    sortable: false,
    CellComponent: AlertMenuCell,
    width: '70px',
  },
];

export const OutbreaksTable = React.memo(({ handlePanelOpen, countryCode }) => {
  const { isLoading, isFetching, error, data, order, orderBy, handleChangeOrderBy } = useTableQuery(
    'outbreaks',
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

OutbreaksTable.propTypes = {
  handlePanelOpen: PropTypes.func.isRequired,
  countryCode: PropTypes.string,
};

OutbreaksTable.defaultProps = {
  countryCode: '',
};
