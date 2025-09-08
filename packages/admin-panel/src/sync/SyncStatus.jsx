import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { formatDistance } from 'date-fns';
import SyncIcon from '@material-ui/icons/Sync';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Tooltip } from '@material-ui/core';
import styled, { keyframes } from 'styled-components';
import { useApiContext } from '../utilities/ApiProvider';
import { makeSubstitutionsInString } from '../utilities';
import { ColumnActionButton } from '../table/columnTypes/ColumnActionButton';

const STATUSES = {
  IDLE: 'IDLE',
  SYNCING: 'SYNCING',
  ERROR: 'ERROR',
};

const SyncStatusContainer = styled.div`
  display: flex;
`;

const PaddedSyncMessage = styled.div`
  padding-left: 3px;
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

const SyncingIconButton = styled(ColumnActionButton)`
  display: flex;

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
  const {
    actionConfig,
    row: { original },
  } = props;
  const api = useApiContext();
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
      const latestLog = latestLogResponse.body.logs[0];

      setStatus(statusResponse.body.sync_status);
      if (latestLog) {
        setLogMessage(formatLog(latestLog));
      }
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // First poll after 0.5 seconds, then poll each 10 seconds
  useEffect(() => {
    const timeout = setTimeout(pollStatus, 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const timer = setInterval(pollStatus, 10000);
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
        <ColumnActionButton className="sync-button" onClick={performManualSync}>
          <SyncIcon />
        </ColumnActionButton>
        <Tooltip title={errorMessage}>
          <StatusMessageContainer>
            <SyncFailingIcon />
            <PaddedSyncMessage>Network error</PaddedSyncMessage>
          </StatusMessageContainer>
        </Tooltip>
      </SyncStatusContainer>
    );
  }

  if (status === STATUSES.ERROR) {
    return (
      <SyncStatusContainer>
        <ColumnActionButton onClick={performManualSync}>
          <SyncIcon />
        </ColumnActionButton>
        <Tooltip title={logMessage}>
          <StatusMessageContainer>
            <SyncFailingIcon />
            <PaddedSyncMessage>Sync failing</PaddedSyncMessage>
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
      <ColumnActionButton onClick={performManualSync}>
        <SyncIcon />
      </ColumnActionButton>
      <Tooltip title={logMessage}>
        <StatusMessageContainer>
          <SyncSuccessIcon />
          <PaddedSyncMessage>Sync online</PaddedSyncMessage>
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
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string,
      sync_status: PropTypes.string,
    }),
  }).isRequired,
};
