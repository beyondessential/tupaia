/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { getFormattedInfo } from '../../utils';
import { MeasureData, Series } from '../../types';

const FirstColumnCell = styled.span`
  font-weight: 500;
  text-align: left;
`;

const processColumns = (serieses: Series[]) => {
  if (!serieses) {
    return [];
  }

  const configColumns = serieses
    .filter(column => !column.hideFromTable)
    .map(column => {
      return {
        // @ts-ignore - The react table accessors don't work as strings if the key has a space so we
        // need to use the function accessor. The row and column could be any type so we need to ignore
        accessor: (row: any) => row[column.key],
        Header: column.name,
      };
    });

  return [
    {
      Header: 'Name',
      accessor: 'name',
      // eslint-disable-next-line react/prop-types
      Cell: (value: { value: string | number | boolean | undefined }) => {
        <FirstColumnCell>{String(value)}</FirstColumnCell>;
      },
    },
    ...configColumns,
  ];
};

const processData = (serieses: Series[], measureData: MeasureData[]) => {
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
    };
  });
};

export const getMapTableData = (serieses: Series[], measureData: MeasureData[]) => {
  const columns = useMemo(() => processColumns(serieses), [JSON.stringify(serieses)]);
  const data = useMemo(
    () => processData(serieses, measureData),
    [JSON.stringify(serieses), JSON.stringify(measureData)],
  );

  return {
    columns,
    data,
  };
};
