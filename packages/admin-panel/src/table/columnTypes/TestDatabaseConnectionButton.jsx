import React, { useState } from 'react';
import PropTypes from 'prop-types';
import NetworkCheck from '@material-ui/icons/NetworkCheck';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Tooltip } from '@material-ui/core';
import styled from 'styled-components';
import { useApiContext } from '../../utilities/ApiProvider';
import { makeSubstitutionsInString } from '../../utilities';
import { ColumnActionButton } from './ColumnActionButton';

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
  justify-content: flex-start;
  width: 100%;
  flex: 1;
`;

const SuccessIcon = styled(CheckCircleIcon)`
  padding-left: 5px;
  color: ${props => props.theme.palette.success.main};
`;

const FailedIcon = styled(ErrorIcon)`
  padding-left: 5px;
  color: ${props => props.theme.palette.error.main};
`;

export const TestDatabaseConnectionButton = ({ row }) => {
  const api = useApiContext();
  const [buttonState, setButtonState] = useState(BUTTON_STATES.IDLE);
  const [toolTip, setTooltip] = useState(null);

  const testConnectionEndpoint = makeSubstitutionsInString(
    testDatabaseConnectionEndpointTemplate,
    row.original,
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
    <ColumnActionButton
      disabled={disabled}
      onClick={testConnection}
      title="Click to test database connection"
    >
      <NetworkCheck />
    </ColumnActionButton>
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

TestDatabaseConnectionButton.propTypes = {
  row: PropTypes.object.isRequired,
};
