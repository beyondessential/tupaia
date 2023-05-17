/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import { DataTable, SmallAlert } from '@tupaia/ui-components';
import { ViewContent } from '../types';
import { getChartTableData, getIsChartData, getNoDataString } from '../utils';

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

interface ChartTableProps {
  viewContent: ViewContent;
  className?: string;
}

export const ChartTable: React.FC<ChartTableProps> = ({ viewContent, className }) => {
  const { columns, data } = getChartTableData(viewContent);

  if (!getIsChartData(viewContent)) {
    return (
      <NoData severity="info" variant="standard">
        {getNoDataString(viewContent)}
      </NoData>
    );
  }

  return (
    <TableContainer className={className}>
      <DataTable columns={columns} data={data} />
    </TableContainer>
  );
};
