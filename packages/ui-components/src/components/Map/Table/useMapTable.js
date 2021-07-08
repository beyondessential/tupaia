/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import { getFormattedInfo } from '../utils';

const processColumns = measureOptions => {
  const columns = measureOptions.map(column => {
    return { accessor: column.key, Header: column.name };
  });

  return [
    { accessor: 'name', Header: 'Name' },
    ...columns,
    { accessor: 'submissionDate', Header: 'Submission Date' },
  ];
};

const processData = (serieses, measureData) => {
  return measureData.map(row => {
    const columns = serieses.reduce((cols, measureOption) => {
      const value = getFormattedInfo(row, measureOption).formattedValue;
      return { ...cols, [measureOption.key]: value };
    }, {});

    return {
      name: row.name,
      ...columns,
      submissionDate: row.submissionDate ?? 'No data',
    };
  });
};

export const useMapTable = (measureOptions, measureData) => {
  const columns = useMemo(() => processColumns(measureOptions), []);
  const data = useMemo(() => processData(measureOptions, measureData), []);

  return useTable(
    {
      columns,
      data,
    },
    useSortBy,
  );
};
