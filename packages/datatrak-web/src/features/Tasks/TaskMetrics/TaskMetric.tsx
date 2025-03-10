import { SpinningLoader } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';

const MetricWrapper = styled.div`
  flex: 1;
  display: flex;
  border: 1px solid #3f5539;
  border-radius: 3px;
  margin-inline: 0.5rem;
  margin-block-end: auto;
`;

const MetricText = styled.p`
  font-size: 0.8rem;
  line-height: 1rem;
  padding: 0.1rem 0.7rem;
  min-height: 40px;
  min-width: 3rem;
  align-content: center;
  text-align: center;
  font-weight: 500;
  margin: 0;
`;

const MetricNumber = styled(MetricText)`
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const TaskMetric = ({ number, text, isLoading }) => {
  return (
    <MetricWrapper>
      <MetricNumber>{isLoading ? <SpinningLoader spinnerSize={14} /> : number}</MetricNumber>
      <MetricText>{text}</MetricText>
    </MetricWrapper>
  );
};
