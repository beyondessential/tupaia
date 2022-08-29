/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatDistance } from 'date-fns';
import SyncIcon from '@material-ui/icons/Sync';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Tooltip } from '@material-ui/core';
import styled, { keyframes } from 'styled-components';
import { useApi } from '../utilities/ApiProvider';
import { IconButton } from '../widgets';
import { makeSubstitutionsInString } from '../utilities';

const STATUSES = {
  IDLE: 'IDLE',
  SYNCING: 'SYNCING',
  ERROR: 'ERROR',
};

const SyncStatusContainer = styled.div`
  display: flex;
`;

const StatusMessageContainer = styled.div`
  display: flex;
  align-items: center;
  padding-left: 5px;
`;

const spin = keyframes`
  0% { 
      transform: rotate(360deg); 
  }

   100% { 
      transform: rotate(0deg); 
  }
 `;

const SyncSuccessIcon = styled(CheckCircleIcon)`
  color: ${props => props.theme.palette.success.main};
`;

const SyncFailingIcon = styled(ErrorIcon)`
  color: ${props => props.theme.palette.error.main};
`;

const SpinningSyncIcon = styled(SyncIcon)`
  color: white;

  animation: 3s ${spin};
  animation-timing-function: linear;
  animation-iteration-count: infinite;
`;

const SyncingIconButton = styled(IconButton)`
  display: flex;

  background-color: ${props => props.theme.palette.blue[100]};

  &.Mui-disabled {
    background-color: ${props => props.theme.palette.primary.main};
    color: white;
  }
`;

// Bit of a hack to work around the fact that the sync button is constantly being recreated
// in the resource page due to parent component re-rendering https://stackoverflow.com/a/33800398
const externalState = {};

const useExternalState = (key, initialState) => {
  const [state, setState] = useState(() => {
    if (key in externalState) {
      return externalState[key];
    }
    return initialState;
  });

  const onChange = nextState => {
    externalState[key] = nextState;
    setState(nextState);
  };

  return [state, onChange];
};

const formatLog = ({ timestamp, message }) =>
  `${formatDistance(new Date(timestamp.concat(' UTC')), new Date(), {
    addSuffix: true,
  })}: ${message}`;

export const SyncStatus = props => {
  const { actionConfig, original } = props;
  const api = useApi();
  const [status, setStatus] = useExternalState(`${original.id}.status`, original.sync_status);
  const [logMessage, setLogMessage] = useExternalState(`${original.id}.logMessage`, '');
  const [errorMessage, setErrorMessage] = useState(null);

  const syncStatusEndpoint = makeSubstitutionsInString(actionConfig.syncStatusEndpoint, original);
  const latestSyncLogEndpoint = makeSubstitutionsInString(
    actionConfig.latestSyncLogEndpoint,
    original,
  );
  const manualSyncEndpoint = makeSubstitutionsInString(actionConfig.manualSyncEndpoint, original);

  const pollStatus = async () => {
    try {
      const statusResponse = await api.get(syncStatusEndpoint);
      const latestLogResponse = await api.get(latestSyncLogEndpoint);
      setStatus(statusResponse.body.sync_status);
      setLogMessage(formatLog(latestLogResponse.body.logs[0]));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // First poll after 0.5 seconds, then poll each 5 seconds
  useEffect(() => {
    const timeout = setTimeout(pollStatus, 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const timer = setInterval(pollStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  const performManualSync = async () => {
    try {
      await api.post(manualSyncEndpoint);
      setStatus(STATUSES.SYNCING);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (errorMessage) {
    return (
      <SyncStatusContainer>
        <IconButton onClick={performManualSync}>
          <SyncIcon />
        </IconButton>
        <Tooltip title={errorMessage}>
          <StatusMessageContainer>
            <SyncFailingIcon />
            <div>Network error</div>
          </StatusMessageContainer>
        </Tooltip>
      </SyncStatusContainer>
    );
  }

  if (status === STATUSES.ERROR) {
    return (
      <SyncStatusContainer>
        <IconButton onClick={performManualSync}>
          <SyncIcon />
        </IconButton>
        <Tooltip title={logMessage}>
          <StatusMessageContainer>
            <SyncFailingIcon />
            <div>Sync failing</div>
          </StatusMessageContainer>
        </Tooltip>
      </SyncStatusContainer>
    );
  }

  if (status === STATUSES.SYNCING) {
    return (
      <SyncStatusContainer>
        <SyncingIconButton disabled>
          <SpinningSyncIcon />
        </SyncingIconButton>
        <StatusMessageContainer>
          <div>Sync in progress</div>
        </StatusMessageContainer>
      </SyncStatusContainer>
    );
  }

  return (
    <SyncStatusContainer>
      <IconButton onClick={performManualSync}>
        <SyncIcon />
      </IconButton>
      <Tooltip title={logMessage}>
        <StatusMessageContainer>
          <SyncSuccessIcon />
          <div>Sync online</div>
        </StatusMessageContainer>
      </Tooltip>
    </SyncStatusContainer>
  );
};

SyncStatus.propTypes = {
  actionConfig: PropTypes.shape({
    syncStatusEndpoint: PropTypes.string,
    latestSyncLogEndpoint: PropTypes.string,
    manualSyncEndpoint: PropTypes.string,
  }).isRequired,
  original: PropTypes.shape({ id: PropTypes.string, sync_status: PropTypes.string }).isRequired,
};
