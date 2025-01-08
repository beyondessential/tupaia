import { LinearProgress } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

/** Maps [0.0, 1.0] to [0, 100], but won’t round up to 100. Returns 100 if and only if given 1.0 */
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
  isSyncing: boolean;
  /** A number the closed interval [0.0, 1.0] */
  value: number;
}

export const SyncProgress = ({ isSyncing, value }: SyncProgressProps) => {
  const percentage = floatToPercentage(value);
  return (
    <>
      <h2>{isSyncing ? `Syncing ${percentage}%` : 'Sync complete'}</h2>
      <Progress value={percentage} />
    </>
  );
};
