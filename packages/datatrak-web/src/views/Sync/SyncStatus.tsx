import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { LinearProgress, useTheme } from '@material-ui/core';
import { CircleCheck, CircleX } from 'lucide-react';

import { SyncHeading } from './SyncHeading';
import { SyncParagraph } from './SyncParagraph';

const Wrapper = styled.div`
  inline-size: 100%;

  > * + * {
    margin-block-start: 1rem;
  }
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
  syncStage: number | null;
  totalStages: number;
  isSyncing: boolean;
  syncFinishedSuccessfully: boolean;
  hasError: boolean;
}

export const CheckCircleIcon = styled(CircleCheck)`
  width: 25px;
  height: 25px;
`;

export const XCircleIcon = styled(CircleX)`
  width: 25px;
  height: 25px;
`;

export const SyncStatus = ({
  isSyncing,
  percentage,
  message,
  syncFinishedSuccessfully,
  syncStage,
  totalStages,
  hasError,
  ...props
}: SyncStatusProps) => {
  const theme = useTheme();

  return (
    <Wrapper {...props}>
      {isSyncing && (
        <>
          <SyncHeading>Syncing {percentage}%</SyncHeading>
          <Progress value={percentage ?? undefined} />
        </>
      )}

      {syncStage && (
        <SyncParagraph>
          Sync stage {syncStage} of {totalStages}
        </SyncParagraph>
      )}

      {message && <SyncParagraph>{message}</SyncParagraph>}

      {syncFinishedSuccessfully && (
        <>
          <SyncHeading>Sync complete</SyncHeading>
          <CheckCircleIcon color={theme.palette.success.main} />
        </>
      )}

      {hasError && (
        <>
          <SyncHeading>Sync failed</SyncHeading>
          <XCircleIcon color={theme.palette.error.main} />
        </>
      )}
    </Wrapper>
  );
};
