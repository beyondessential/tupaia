/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SyncIcon from '@material-ui/icons/Sync';
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

const spin = keyframes`
    0% { 
        transform: rotate(360deg); 
    }

    100% { 
        transform: rotate(0deg); 
    }
`;

const SpinningSyncIcon = styled(SyncIcon)`
  color: white;

  animation: 3s ${spin};
  animation-timing-function: linear;
  animation-iteration-count: infinite;
`;

const ActiveIconButton = styled(IconButton)`
  background-color: ${props => props.theme.palette.success.main};

  &.Mui-disabled {
    background-color: ${props => props.theme.palette.success.main};
    color: white;
  }
`;

const ErrorIconButton = styled(IconButton)`
  background-color: ${props => props.theme.palette.warning.main};
  color: ${props => props.theme.palette.common.white};

  &:hover {
    background-color: ${props => props.theme.palette.warning.dark};
  }

  &.Mui-disabled {
    background-color: ${props => props.theme.palette.warning.main};
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

export const SyncButton = props => {
  const { actionConfig, original } = props;
  const api = useApi();
  const [status, setStatus] = useExternalState(original.id, original.sync_status);
  const [errorMessage, setErrorMessage] = useState(null);

  const syncStatusEndpoint = makeSubstitutionsInString(actionConfig.syncStatusEndpoint, original);
  const manualSyncEndpoint = makeSubstitutionsInString(actionConfig.manualSyncEndpoint, original);

  const pollStatus = async () => {
    try {
      const response = await api.get(syncStatusEndpoint);
      setStatus(response.body.sync_status);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

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

  if (errorMessage || status === STATUSES.ERROR) {
    return (
      <Tooltip
        title={errorMessage || 'Latest sync attempt failed, check logs for more information'}
      >
        <ErrorIconButton onClick={performManualSync}>
          <SyncIcon />
        </ErrorIconButton>
      </Tooltip>
    );
  }

  if (status === STATUSES.SYNCING) {
    return (
      <ActiveIconButton disabled>
        <SpinningSyncIcon />
      </ActiveIconButton>
    );
  }

  return (
    <IconButton onClick={performManualSync}>
      <SyncIcon />
    </IconButton>
  );
};

SyncButton.propTypes = {
  actionConfig: PropTypes.shape({
    syncStatusEndpoint: PropTypes.string,
    manualSyncEndpoint: PropTypes.string,
  }).isRequired,
  original: PropTypes.shape({ id: PropTypes.string, sync_status: PropTypes.string }).isRequired,
};
