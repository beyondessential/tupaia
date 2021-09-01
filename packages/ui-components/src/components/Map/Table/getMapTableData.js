/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { getFormattedInfo } from '../utils';

const FirstColumnCell = styled.span`
  font-weight: 500;
  text-align: left;
`;

const processColumns = serieses => {
  if (!serieses) {
    return [];
  }

  const configColumns = serieses.map(column => {
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
    { Header: 'Most Recent Data Date', accessor: 'submissionDate' },
  ];
};

const processData = (serieses, measureData) => {
  if (!measureData || !serieses) {
    return [];
  }

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

export const getMapTableData = (serieses, measureData) => {
  const columns = useMemo(() => processColumns(serieses), [JSON.stringify(serieses)]);
  const data = useMemo(() => processData(serieses, measureData), [
    JSON.stringify(serieses),
    JSON.stringify(measureData),
  ]);
  return {
    columns,
    data,
  };
};
