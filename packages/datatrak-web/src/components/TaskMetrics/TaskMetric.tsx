import { SpinningLoader } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';

const MetricWrapper = styled.div`
  display: flex;
  border: 1px solid #3f5539;
  border-radius: 3px;
  margin-inline: 0.5rem;
  margin-block-end: auto;
  min-width: 28%;
  ${({ theme }) => theme.breakpoints.down('xs')} {
    width: inherit;
    margin-block-start: 0.5rem;
    margin-inline: 0;
  }
`;

const MetricNumber = styled.p`
  font-size: 0.875rem;
  line-height: 1.75;
  padding: 0.5rem 1.75rem;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
  min-width: 3rem;
  padding-inline: 0.9rem;
  align-content: center;
  text-align: center;
  font-weight: 500;
  margin: 0;
`;

const MetricText = styled.p`
  line-height: 1.75;
  letter-spacing: 0;
  padding: 0.5rem 1.75rem;
  padding-inline-end: 1.2rem;
  padding-inline-start: 0.9rem;
  font-weight: 500;
  margin: 0;
  ${({ theme }) => theme.breakpoints.up('lg')} {
    min-width: 16rem;
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
