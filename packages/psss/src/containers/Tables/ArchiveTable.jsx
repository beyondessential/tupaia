import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, useTableSorting } from '@tupaia/ui-components';
import {
  SyndromeCell,
  ArchivedAlertMenuCell,
  CountryNameCell,
  WeekAndDateCell,
} from '../../components';
import { useAlerts } from '../../api';
import { getCountryCodes } from '../../store';
import { RestoreArchivedAlertModal, DeleteAlertModal } from '../Modals';
import { ArchiveTableContext } from '../../context';

const createColumns = isSingleCountry => [
  ...(isSingleCountry
    ? []
    : [
        {
          title: 'Country',
          key: 'organisationUnit',
          width: '25%',
          align: 'left',
          CellComponent: CountryNameCell,
        },
      ]),
  {
    title: 'Syndrome',
    key: 'syndrome',
    align: 'left',
    width: '100px',
    CellComponent: SyndromeCell,
  },
  {
    title: 'Alert Start Date',
    key: 'period',
    align: 'left',
    width: '220px',
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Cases Since Alert Began',
    key: 'totalCases',
    align: 'left',
  },
  // TODO uncomment when outbreak functionality is added
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
  // TODO uncomment when outbreak functionality is added
  // {
  //   title: 'Total Lab Confirmed Cases',
  //   key: 'diagnosis',
  //   align: 'left',
  // },
  {
    title: '',
    key: 'id',
    sortable: false,
    CellComponent: ArchivedAlertMenuCell,
    width: '70px',
  },
];

export const ArchiveTableComponent = React.memo(({ countryCodes, period }) => {
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [alertId, setAlertId] = useState(null);
  const isSingleCountry = countryCodes.length === 1;
  const columns = createColumns(isSingleCountry);
  const { data, isLoading, error, isFetching } = useAlerts(period, countryCodes, 'archive');
  const { sortedData, order, orderBy, sortColumn } = useTableSorting(data);

  return (
    <ArchiveTableContext.Provider
      value={{
        alertId,
        setAlertId,
        isRestoreModalOpen,
        setIsRestoreModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
      }}
    >
      <Table
        data={sortedData}
        orderBy={orderBy}
        order={order}
        onChangeOrderBy={sortColumn}
        isLoading={isLoading}
        isFetching={!isLoading && isFetching}
        errorMessage={error && error.message}
        noDataMessage="No archived alerts found"
        columns={columns}
      />
      <RestoreArchivedAlertModal
        isOpen={isRestoreModalOpen}
        alertId={alertId}
        onClose={() => setIsRestoreModalOpen(false)}
      />
      <DeleteAlertModal
        isOpen={isDeleteModalOpen}
        alertId={alertId}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </ArchiveTableContext.Provider>
  );
});

ArchiveTableComponent.propTypes = {
  countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  period: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  countryCodes: getCountryCodes(state),
});

export const ArchiveTable = connect(mapStateToProps)(ArchiveTableComponent);
