/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ViewConfig } from '@tupaia/types';
import { ViewDataItem } from '../../../types';

const Text = styled(Typography)`
  font-size: 1.5rem;
  text-align: center;
  &:not(:only-of-type) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
`;
interface SingleDateProps {
  data?: ViewDataItem[];
  config?: ViewConfig;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (!value || isNaN(date.getTime())) return 'Not yet assessed';
  return date.toDateString();
};

export const SingleDate = ({ data = [] }: SingleDateProps) => {
  const { value } = data[0] || {};
  const formattedValue = formatDate(value as string);
  return <Text>{formattedValue}</Text>;
};
