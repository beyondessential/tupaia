/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Table, useTableSorting } from '@tupaia/ui-components';

export const LogsTable = ({ logs, logsCount, page, logsPerPage, onChangePage }) => {
  const { sortedData, order, orderBy, sortColumn } = useTableSorting(logs);
  return (
    <Table
      count={logsCount}
      page={page}
      onChangePage={onChangePage}
      rowsPerPage={logsPerPage}
      rowsPerPageOptions={[]}
      data={sortedData}
      order={order}
      orderBy={orderBy}
      onChangeOrderBy={sortColumn}
      columns={[
        { key: 'timestamp', title: 'time', sortable: true, width: '250px', align: 'left' },
        { key: 'message', title: 'message', sortable: false, align: 'left' },
      ]}
      rowProps={{ height: '30px' }}
    />
  );
};

LogsTable.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({ timestamp: PropTypes.string, message: PropTypes.string }),
  ).isRequired,
  logsCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  logsPerPage: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
};
