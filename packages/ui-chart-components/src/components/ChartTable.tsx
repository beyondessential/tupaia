/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DataTable, NoData } from '@tupaia/ui-components';
import { ChartViewContent } from '../types';
import { getChartTableData, getIsChartData } from '../utils';

interface ChartTableProps {
  viewContent: ChartViewContent;
  className?: string;
  stickyHeader?: boolean;
}

export const ChartTable = ({ viewContent, className, stickyHeader }: ChartTableProps) => {
  const { columns, data } = getChartTableData(viewContent);

  if (!getIsChartData(viewContent)) {
    return <NoData viewContent={viewContent} />;
  }

  return (
    <DataTable columns={columns} data={data} className={className} stickyHeader={stickyHeader} />
  );
};
