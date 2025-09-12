import { LinearProgress, Typography } from '@material-ui/core';
import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core';

import { CheckCircleIcon } from '../../components/Icons/CheckCircleIcon';

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
  percentage: number | null;
  message: string | null;
  syncStageMessage: string | null;
  isSyncing: boolean;
  syncFinishedSuccessfully: boolean;
}

export const SyncStatus = ({
  isSyncing,
  percentage,
  message,
  syncFinishedSuccessfully,
  syncStageMessage,
  ...props
}: SyncStatusProps) => {
  const successColor = useTheme().palette.success.main;

  return (
    <Wrapper {...props}>
      <Heading>{message}</Heading>
      <Heading>{syncStageMessage}</Heading>
      {isSyncing ? <Progress value={percentage ?? undefined} /> : null}
      {syncFinishedSuccessfully ? <CheckCircleIcon htmlColor={successColor} /> : null}
    </Wrapper>
  );
};
