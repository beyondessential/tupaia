/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import { DataTable, NoData } from '@tupaia/ui-components';
import { ChartConfig, ChartReport } from '@tupaia/types';
import { getChartTableData, getIsChartData } from '../utils';

const TableContainer = styled(MuiTableContainer)`
  overflow: auto;
`;

interface ChartTableProps {
  config: ChartConfig;
  report: ChartReport;
  className?: string;
}

export const ChartTable = ({ config, report, className }: ChartTableProps) => {
  const { columns, data } = getChartTableData(report);

  if (!getIsChartData(config?.chartType, report)) {
    return <NoData report={report} config={config} />;
  }

  return (
    <TableContainer className={className}>
      <DataTable columns={columns} data={data} />
    </TableContainer>
  );
};
