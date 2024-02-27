/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import { ConditionalPresentationOptions } from '@tupaia/types';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { MatrixContext } from './MatrixContext';
import { getIsUsingDots } from './utils';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  &:not(:last-child) {
    margin-right: 1rem;
  }
`;

const LegendDot = styled.div<{ $color?: string }>`
  background-color: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.palette.text.primary};
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
`;

const LegendLabel = styled(Typography)`
  margin-left: 0.5rem;
`;

/**
 * Renders a legend for the matrix, if the matrix is using dots
 */
export const MatrixLegend = () => {
  const { presentationOptions } = useContext(MatrixContext);

  // Only render if the matrix is using dots. Otherwise, return null
  if (!presentationOptions || !getIsUsingDots(presentationOptions)) return null;

  const { conditions } = presentationOptions as ConditionalPresentationOptions;
  const legendConditions = conditions?.filter(condition => !!condition.legendLabel);

  // Only render if there are legend conditions. Otherwise, return null
  if (legendConditions?.length === 0) return null;
  return (
    <Wrapper>
      {legendConditions?.map(({ color, legendLabel }) => (
        <LegendItem key={legendLabel}>
          <LegendDot $color={color} />
          <LegendLabel>{legendLabel}</LegendLabel>
        </LegendItem>
      ))}
    </Wrapper>
  );
};
