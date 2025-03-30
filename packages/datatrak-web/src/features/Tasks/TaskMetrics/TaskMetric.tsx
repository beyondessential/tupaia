import { SpinningLoader } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';

const MetricWrapper = styled.div`
  flex: 1;
  display: flex;
  border: max(0.0625rem, 1px) solid #3f5539;
  border-radius: 3px;
  margin-inline: 0.5rem;
  margin-block-end: auto;
  text-wrap: balance;
`;

const MetricText = styled.p`
  align-content: center;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1rem;
  margin: 0;
  min-block-size: 2.5rem;
  min-inline-size: 3rem;
  padding-block: 0.1rem;
  padding-inline: 0.7rem;
  text-align: center;
`;

const MetricNumber = styled(MetricText)`
  border-right: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
`;

export const TaskMetric = ({ number, text, isLoading }) => {
  return (
    <MetricWrapper>
      <MetricNumber>{isLoading ? <SpinningLoader spinnerSize={14} /> : number}</MetricNumber>
      <MetricText>{text}</MetricText>
    </MetricWrapper>
  );
};
