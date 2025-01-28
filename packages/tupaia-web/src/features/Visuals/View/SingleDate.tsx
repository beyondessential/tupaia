import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ViewConfig, ViewReport } from '@tupaia/types';

const Text = styled(Typography)`
  font-size: 1.5rem;
  text-align: center;
  &:not(:only-of-type) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h3',
})`
  margin: 0.3rem 0;
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  text-align: center;
  line-height: 1.4;
`;
interface SingleDateProps {
  report: ViewReport;
  config: ViewConfig;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (!value || isNaN(date.getTime())) return 'Not yet assessed';
  return date.toDateString();
};

export const SingleDate = ({ report: { data = [] } }: SingleDateProps) => {
  const { value, name } = data[0] || {};
  const formattedValue = formatDate(value as string);

  return (
    <>
      {name && <Title>{name}</Title>}
      <Text>{formattedValue}</Text>
    </>
  );
};
