/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useTable, useSortBy } from 'react-table';
import { getFormattedInfo } from '../utils';

const FirstColumnCell = styled.span`
  font-weight: 500;
  text-align: left;
`;

const processColumns = measureOptions => {
  const configColumns = measureOptions.map(column => {
    return { accessor: column.key, Header: column.name };
  });

  return [
    {
      Header: 'Name',
      accessor: 'name',
      // eslint-disable-next-line react/prop-types
      Cell: ({ value }) => <FirstColumnCell>{String(value)}</FirstColumnCell>,
    },
    ...configColumns,
    { Header: 'Submission Date', accessor: 'submissionDate' },
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
