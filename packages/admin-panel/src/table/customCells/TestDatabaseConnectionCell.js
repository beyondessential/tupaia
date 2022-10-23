/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import NetworkCheck from '@material-ui/icons/NetworkCheck';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Tooltip } from '@material-ui/core';
import styled from 'styled-components';
import { useApi } from '../../utilities/ApiProvider';
import { IconButton } from '../../widgets';
import { makeSubstitutionsInString } from '../../utilities';

const BUTTON_STATES = {
  IDLE: 'idle',
  TESTING: 'testing',
  SUCCESS: 'success',
  FAILED: 'failed',
};

const testDatabaseConnectionEndpointTemplate = 'externalDatabaseConnections/{id}/test';

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SuccessIcon = styled(CheckCircleIcon)`
  padding-left: 5px;
  color: ${props => props.theme.palette.success.main};
`;

const FailedIcon = styled(ErrorIcon)`
  padding-left: 5px;
  color: ${props => props.theme.palette.error.main};
`;

const TestConnectionIconButton = styled(IconButton)`
  display: flex;
`;

export const TestDatabaseConnectionCell = ({ row }) => {
  const api = useApi();
  const [buttonState, setButtonState] = useState(BUTTON_STATES.IDLE);
  const [toolTip, setTooltip] = useState(null);

  const testConnectionEndpoint = makeSubstitutionsInString(
    testDatabaseConnectionEndpointTemplate,
    row,
  );

  const testConnection = async () => {
    try {
      setButtonState(BUTTON_STATES.TESTING);
      await api.get(testConnectionEndpoint);
      setButtonState(BUTTON_STATES.SUCCESS);
      setTooltip('Connection successful');
    } catch (error) {
      setTooltip(error.message);
      setButtonState(BUTTON_STATES.FAILED);
    }
  };

  const TestConnectionButton = ({ disabled = false }) => (
    <Tooltip title="Click to test database connection">
      <TestConnectionIconButton disabled={disabled} onClick={testConnection}>
        <NetworkCheck />
      </TestConnectionIconButton>
    </Tooltip>
  );

  if (buttonState === BUTTON_STATES.SUCCESS) {
    return (
      <ButtonContainer>
        <TestConnectionButton />
        <Tooltip title={toolTip}>
          <SuccessIcon />
        </Tooltip>
      </ButtonContainer>
    );
  }

  if (buttonState === BUTTON_STATES.FAILED) {
    return (
      <ButtonContainer>
        <TestConnectionButton />
        <Tooltip title={toolTip}>
          <FailedIcon />
        </Tooltip>
      </ButtonContainer>
    );
  }

  if (buttonState === BUTTON_STATES.TESTING) {
    return (
      <ButtonContainer>
        <TestConnectionButton disabled />
      </ButtonContainer>
    );
  }

  return (
    <ButtonContainer>
      <TestConnectionButton />
    </ButtonContainer>
  );
};

TestDatabaseConnectionCell.propTypes = {
  row: PropTypes.object.isRequired,
};
