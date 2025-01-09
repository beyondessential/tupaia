import { LinearProgress, Typography } from '@material-ui/core';
import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core';

import { CheckCircleIcon } from '../../components/Icons/CheckCircleIcon';

/** Maps [0.0, 1.0] to [0, 100], but won’t round up to 100. Returns 100 if and only if given 1.0 */
const clamp = value => Math.min(Math.max(value, 0.0), 1.0);
const floatToPercentage = (float: number) => {
  const clamped = clamp(float);
  if (clamped === 1.0) return 100;
  if (clamped < 0.99) return float * 100;
  return 99;
};

const Wrapper = styled.div`
  inline-size: 100%;

  > * + * {
    margin-block-start: 1rem;
  }
`;

const Heading = styled(Typography).attrs({ variant: 'h2' })`
  font-size: inherit;
  letter-spacing: initial;
`;

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

interface SyncStatusProps extends HTMLAttributes<HTMLDivElement> {
  /** A number the closed interval [0.0, 1.0], or null if not actively syncing */
  value: number | null;
}

export const SyncStatus = ({ value, ...props }: SyncStatusProps) => {
  const isSyncing = value !== null;
  const percentage = isSyncing ? floatToPercentage(value) : undefined;
  const successColor = useTheme().palette.success.main;

  return (
    <Wrapper {...props}>
      <Heading>{isSyncing ? `Syncing ${percentage}%` : 'Sync complete'}</Heading>
      {isSyncing ? <Progress value={percentage} /> : <CheckCircleIcon htmlColor={successColor} />}
    </Wrapper>
  );
};
