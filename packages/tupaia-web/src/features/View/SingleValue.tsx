/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewConfig } from '@tupaia/types';
import { formatDataValueByType } from '@tupaia/utils';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

const Text = styled(Typography)`
  font-size: 3.125rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  text-align: center;
`;
interface SingleValueProps {
  data: {
    name: string;
    value: number;
    total?: number;
  };
  config?: ViewConfig;
}
export const SingleValue = ({ data, config }: SingleValueProps) => {
  const { valueType, value_metadata: valueMetadata } = config;
  const { name, value, total } = data;
  const metadata = valueMetadata || config[`${name}_metadata`];

  const formattedValue = formatDataValueByType(
    { value, metadata: { ...metadata, total } },
    valueType,
  );
  return <Text>{formattedValue}</Text>;
};
