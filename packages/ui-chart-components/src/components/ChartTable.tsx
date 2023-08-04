/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import { DataTable, NoData } from '@tupaia/ui-components';
import { ViewContent } from '../types';
import { getChartTableData, getIsChartData } from '../utils';

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

interface ChartTableProps {
  viewContent: ViewContent;
  className?: string;
}

export const ChartTable = ({ viewContent, className }: ChartTableProps) => {
  const { columns, data } = getChartTableData(viewContent);

  if (!getIsChartData(viewContent)) {
    return <NoData viewContent={viewContent} />;
  }

  return (
    <TableContainer className={className}>
      <DataTable columns={columns} data={data} />
    </TableContainer>
  );
};
