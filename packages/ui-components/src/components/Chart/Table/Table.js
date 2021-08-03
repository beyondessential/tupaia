/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import { DataTable } from '@tupaia/ui-components';
import { getIsChartData, getNoDataString } from '../utils';
import { SmallAlert } from '../../Alert';
import { useChartTable } from './useChartTable';

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

export const Table = ({ viewContent, className }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    columns,
  } = useChartTable(viewContent);

  if (!getIsChartData(viewContent)) {
    return (
      <NoData severity="info" variant="standard">
        {getNoDataString(viewContent)}
      </NoData>
    );
  }

  return (
    <TableContainer className={className}>
      <DataTable
        rows={rows}
        columns={columns}
        getTableProps={getTableProps}
        getTableBodyProps={getTableBodyProps}
        headerGroups={headerGroups}
        prepareRow={prepareRow}
      />
    </TableContainer>
  );
};

Table.propTypes = {
  viewContent: PropTypes.shape({
    name: PropTypes.string,
    xName: PropTypes.string,
    periodGranularity: PropTypes.string,
    valueType: PropTypes.string,
    labelType: PropTypes.string,
    chartType: PropTypes.string,
    data: PropTypes.array,
    chartConfig: PropTypes.object,
  }),
  className: PropTypes.string,
};

Table.defaultProps = {
  viewContent: null,
  className: null,
};
