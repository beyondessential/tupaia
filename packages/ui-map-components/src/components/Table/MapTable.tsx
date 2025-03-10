import React from 'react';
import { DataTable } from '@tupaia/ui-components';
import { getMapTableData } from './getMapTableData';
import { MeasureData, Series } from '../../types';

interface MapTableProps {
  serieses: Series[];
  measureData: MeasureData[];
  className?: string;
  stickyHeader?: boolean;
}

export const MapTable = ({
  serieses = [],
  measureData = [],
  className,
  stickyHeader,
}: MapTableProps) => {
  const { columns, data } = getMapTableData(serieses, measureData);

  return (
    <DataTable className={className} columns={columns} data={data} stickyHeader={stickyHeader} />
  );
};
