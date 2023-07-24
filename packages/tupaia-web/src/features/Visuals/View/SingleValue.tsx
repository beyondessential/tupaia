/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { CssColor } from '@tupaia/types';
import { ViewReport, DashboardItemType } from '../../../types';

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
  report: ViewReport;
  config: DashboardItemType;
}

export const SingleValue = ({ report: { data = [] }, config }: SingleValueProps) => {
  const { dataColor } = config;
  const { value } = data[0] || {};
  return <Text $dataColor={dataColor}>{value}</Text>;
};
