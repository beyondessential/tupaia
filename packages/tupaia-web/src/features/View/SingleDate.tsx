/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ViewReport } from '../../types';

const Text = styled(Typography)`
  font-size: 1.5rem;
  text-align: center;
`;
interface SingleDateProps {
  report: ViewReport;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (!value || isNaN(date.getTime())) return 'Not yet assessed';
  return date.toDateString();
};
export const SingleDate = ({ report }: SingleDateProps) => {
  const { value } = report?.data[0];
  const formattedValue = formatDate(value as string);
  return <Text>{formattedValue}</Text>;
};
