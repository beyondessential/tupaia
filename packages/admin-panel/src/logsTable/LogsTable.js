/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Table, useTableSorting } from '@tupaia/ui-components';

const StyledTable = styled(Table)`
  .MuiTableCell-root {
    height: 30px;
  }
`;

export const LogsTable = ({ logs, logsCount, page, logsPerPage, onChangePage }) => {
  const { sortedData, order, orderBy, sortColumn } = useTableSorting(logs);
  return (
    <StyledTable
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
