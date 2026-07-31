import React from 'react';
import { NoData } from '@tupaia/ui-components';
import { DataTable } from '@tupaia/ui-components/dist/components/DataTable';
import { ChartConfig, ChartReport } from '@tupaia/types';
import { getChartTableData, getIsChartData } from '../utils';

interface ChartTableProps {
  config: ChartConfig;
  report: ChartReport;
  className?: string;
  stickyHeader?: boolean;
}

export const ChartTable = ({ config, report, className, stickyHeader }: ChartTableProps) => {
  if (!getIsChartData(config?.chartType, report)) {
    return <NoData config={config} report={report} />;
  }

  const { columns, data } = getChartTableData(report, config);

  return (
    <DataTable columns={columns} data={data} className={className} stickyHeader={stickyHeader} />
  );
};
