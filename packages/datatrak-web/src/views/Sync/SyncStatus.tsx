import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { LinearProgress, useTheme } from '@material-ui/core';

import { CheckCircleIcon } from '../../components/Icons/CheckCircleIcon';
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
}

export const SyncStatus = ({
  isSyncing,
  percentage,
  message,
  syncFinishedSuccessfully,
  syncStage,
  totalStages,
  ...props
}: SyncStatusProps) => {
  const successColor = useTheme().palette.success.main;

  return (
    <Wrapper {...props}>
      {/* Current sync stage indicator */}
      {syncStage && (
        <SyncHeading>
          Sync stage {syncStage} of {totalStages}
        </SyncHeading>
      )}
      
      {/* Active syncing state */}
      {isSyncing && (
        <>
          <SyncHeading>Syncing {percentage}%</SyncHeading>
          <Progress value={percentage ?? undefined} />
        </>
      )}
      
      {/* Status message */}
      {message && <SyncParagraph>{message}</SyncParagraph>}
      
      {/* Success state */}
      {syncFinishedSuccessfully && (
        <>
          <SyncHeading>Sync complete</SyncHeading>
          <CheckCircleIcon htmlColor={successColor} />
        </>
      )}
    </Wrapper>
  );
};
