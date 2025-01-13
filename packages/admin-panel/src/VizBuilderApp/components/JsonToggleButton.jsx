import React from 'react';
import styled from 'styled-components';
import { FormControlLabel, Switch } from '@material-ui/core';
import { usePreviewDataContext } from '../context';

const ControlLabel = styled(FormControlLabel)`
  color: ${props => (props.$jsonToggleEnabled ? props.theme.palette.primary.main : 'grey')};
  margin-bottom: -10px;
  .MuiFormControlLabel-label {
    font-size: 10px;
    margin-bottom: -10px;
  }
`;

export const JsonToggleButton = () => {
  const { jsonToggleEnabled, setJsonToggleEnabled } = usePreviewDataContext();

  const handleClick = () => {
    setJsonToggleEnabled(!jsonToggleEnabled);
  };

  return (
    <ControlLabel
      value="top"
      control={<Switch color="primary" />}
      label="JSON"
      onChange={handleClick}
      labelPlacement="top"
      $jsonToggleEnabled={jsonToggleEnabled}
    />
  );
};
