import { LinearProgress } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

const clamp = value => Math.min(Math.max(value, 0.0), 1.0);
const floatToPercentage = (float: number) => {
  const clamped = clamp(float);

  if (clamped === 1.0) return 100;
  if (clamped < 0.99) return float * 100;

  return 99;
};

const Progress = styled(LinearProgress).attrs({ variant: 'determinate' })`
  background-color: transparent;
  block-size: 1.5rem;
  inline-size: 100%;
  outline-color: ${props => props.theme.palette.primary.main};
  outline-offset: max(0.125rem, 2px);
  outline-style: solid;
  outline-width: max(0.0625rem, 1px);

  &,
  & .MuiLinearProgress-bar {
    border-radius: calc(infinity * 1px);
  }
`;

interface SyncProgressProps {
  /** A number the closed interval [0.0, 1.0] */
  value: number;
}

export const SyncProgress = ({ value }: SyncProgressProps) => {
  return (
    <>
      <p>Sync complete</p>
      <p>
        Last successful sync: <time></time>
      </p>
      <Progress value={floatToPercentage(value)} />
    </>
  );
};
