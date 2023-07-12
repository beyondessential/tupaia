/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewConfig } from '@tupaia/types';
import { formatDataValueByType } from '@tupaia/utils';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ViewDataItem } from '../../types';

const Text = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  text-align: center;
  font-size: 3.125rem;
  &:not(:only-of-type) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
`;
interface SingleValueProps {
  data?: ViewDataItem[];
  config?: ViewConfig;
}

export const SingleValue = ({ data, config }: SingleValueProps) => {
  const { valueType, value_metadata: valueMetadata } = config;
  const { name, value, total } = data![0];
  const metadata = valueMetadata || config[`${name}_metadata`];

  const formattedValue = formatDataValueByType(
    { value, metadata: { ...metadata, total } },
    valueType,
  );
  return <Text>{formattedValue}</Text>;
};
