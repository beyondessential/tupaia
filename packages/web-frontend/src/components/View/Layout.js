/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import styled from 'styled-components';
import { darkWhite } from '../../styles';

export const FlexStart = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const FlexEnd = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const FlexSpaceBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FlexRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const ChartContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 100%;
  align-content: stretch;
  align-items: stretch;

  // recharts components doesn't pass nested styles so they need to be added on a wrapping component
  li.recharts-legend-item {
    white-space: nowrap; // ensure there are no line breaks on the export legends
  }

  ${props => props.theme.breakpoints.down('sm')} {
    height: 200;
    text-align: center;
    position: relative;
  }
`;

export const ChartViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  ${props => props.theme.breakpoints.down('sm')} {
    display: block;
  }
`;
