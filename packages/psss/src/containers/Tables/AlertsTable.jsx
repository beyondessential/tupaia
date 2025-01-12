import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { connect } from 'react-redux';
import { Table, useTableSorting } from '@tupaia/ui-components';
import { useAlerts } from '../../api';
import { SyndromeCell, AlertMenuCell, CountryNameCell, WeekAndDateCell } from '../../components';
import { getCountryCodes } from '../../store';
import { AlertsPanelContext } from '../../context';

const createColumns = isSingleCountry => [
  ...(isSingleCountry
    ? []
    : [
        {
          title: 'Country',
          key: 'organisationUnit',
          width: '28%',
          align: 'left',
          CellComponent: CountryNameCell,
        },
      ]),
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
  // TODO uncomment when reported sites is calculated
  // {
  //   title: 'Sites Reported',
  //   key: 'sitesReported',
  //   align: 'left',
  // },
  {
    title: '',
    key: 'id',
    sortable: false,
    CellComponent: AlertMenuCell,
    width: '45px',
  },
];

const AlertsTableComponent = React.memo(({ countryCodes, period }) => {
  const { setIsOpen, setData } = useContext(AlertsPanelContext);
  const isSingleCountry = countryCodes.length === 1;
  const columns = createColumns(isSingleCountry);
  const { data, isLoading, error, isFetching } = useAlerts(period, countryCodes, 'active');
  const { sortedData, order, orderBy, sortColumn } = useTableSorting(data);

  const handleRowClick = useCallback(
    (_, rowData) => {
      setData(rowData);
      setIsOpen(true);
    },
    [setData, setIsOpen],
  );

  return (
    <Table
      data={sortedData}
      orderBy={orderBy}
      order={order}
      onChangeOrderBy={sortColumn}
      isLoading={isLoading}
      isFetching={!isLoading && isFetching}
      errorMessage={error && error.message}
      noDataMessage="No active alerts found"
      columns={columns}
      onRowClick={handleRowClick}
    />
  );
});

AlertsTableComponent.propTypes = {
  countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  period: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  countryCodes: getCountryCodes(state),
});

export const AlertsTable = connect(mapStateToProps)(AlertsTableComponent);
