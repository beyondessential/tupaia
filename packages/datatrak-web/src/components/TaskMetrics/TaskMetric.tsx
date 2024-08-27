import { SpinningLoader } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';

const MetricWrapper = styled.div`
  display: flex;
  border: 1px solid;
  border-radius: 3px;
  margin-inline: 0.5rem;
  margin-block-end: auto;
  ${({ theme }) => theme.breakpoints.down('xs')} {
    width: inherit;
    margin-block-start: 0.5rem;
    margin-inline: 0;
  }
`;

const MetricNumber = styled.div`
  font-size: 0.875rem;
  line-height: 1.75;
  padding: 0.5em 1.75rem;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
  min-width: 3rem;
  padding-inline: 0.9rem;
  align-content: center;
  text-align: center;
  font-weight: 500;
`;

const MetricText = styled.div`
  line-height: 1.75;
  letter-spacing: 0;
  padding: 0.5rem 1.75rem;
  padding-inline-end: 1.2rem;
  padding-inline-start: 0.9rem;
  font-weight: 500;
  @media (min-width: 1130px) {
    min-width: 12rem;
  }
`;

export const TaskMetric = ({ number, text, isLoading }) => {
  return (
    <MetricWrapper>
      <MetricNumber>{isLoading ? <SpinningLoader spinnerSize={14} /> : number}</MetricNumber>
      <MetricText>{text}</MetricText>
    </MetricWrapper>
  );
};
