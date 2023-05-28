/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DataTable } from '@tupaia/ui-components';
import { getMapTableData } from './getMapTableData';
import { Series, TableMeasureData } from '../../types';

interface MapTableProps {
  serieses: Series[];
  measureData: TableMeasureData[];
  className?: string;
}

export const MapTable = ({ serieses = [], measureData = [], className }: MapTableProps) => {
  const { columns, data } = getMapTableData(serieses, measureData);

  return <DataTable className={className} columns={columns} data={data} />;
};
