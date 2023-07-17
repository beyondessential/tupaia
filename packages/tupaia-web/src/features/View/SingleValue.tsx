/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { CssColor, ViewConfig, SingleValueViewConfig } from '@tupaia/types';
import { ViewDataItem } from '../../types';

const Text = styled(Typography)<{
  $dataColor?: CssColor;
}>`
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  text-align: center;
  font-size: 3.125rem;
  color: ${({ theme, $dataColor }) => $dataColor || theme.palette.text.primary};
  &:not(:only-of-type) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
`;
interface SingleValueProps {
  data?: ViewDataItem[];
  config: ViewConfig;
}

export const SingleValue = ({ data = [], config }: SingleValueProps) => {
  const { dataColor } = config as SingleValueViewConfig;
  const { value } = data[0] || {};
  return <Text $dataColor={dataColor}>{value}</Text>;
};
