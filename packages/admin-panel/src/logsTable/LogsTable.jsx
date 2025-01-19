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
        { key: 'timestamp', title: 'time', disableSortBy: true, width: '250px', align: 'left' },
        { key: 'message', title: 'message', disableSortBy: true, align: 'left' },
      ]}
    />
  );
};

LogsTable.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({ timestamp: PropTypes.string, message: PropTypes.string }),
  ).isRequired,
  logsCount: PropTypes.number,
  page: PropTypes.number.isRequired,
  logsPerPage: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
};

LogsTable.defaultProps = {
  logsCount: null,
};
