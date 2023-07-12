/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

const Text = styled(Typography)`
  font-size: 1.5rem;
  text-align: center;
`;
interface SingleDateProps {
  data: Record<string, any> & {
    value: string;
  };
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (!value || isNaN(date.getTime())) return 'Not yet assessed';
  return date.toDateString();
};
export const SingleDate = ({ data }: SingleDateProps) => {
  const { value } = data;
  const formattedValue = formatDate(value);
  return <Text>{formattedValue}</Text>;
};
