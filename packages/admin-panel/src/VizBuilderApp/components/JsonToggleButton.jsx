import React from 'react';
import styled from 'styled-components';
import { FormControlLabel, Switch } from '@material-ui/core';
import { usePreviewDataContext } from '../context';

const ControlLabel = styled(FormControlLabel)`
  :not(.Mui-checked) {
    color: 'grey';
  }
  .Mui-checked {
    color: ${props => props.theme.palette.primary.main};
  }
  .MuiFormControlLabel-label {
    font-size: 0.75rem;
  }
`;

export const TransformJsonToggle = () => {
  const { showTransformStepAsJson, setShowTransformStepAsJson } = usePreviewDataContext();

  const handleClick = () => {
    setShowTransformStepAsJson(!showTransformStepAsJson);
  };

  return (
    <ControlLabel
      control={<Switch color="primary" />}
      label="Data transform JSON"
      onChange={handleClick}
      labelPlacement="end"
    />
  );
};

export const PresentationJsonToggle = () => {
  const { showPresentationAsJson, setShowPresentationAsJson } = usePreviewDataContext();

  return (
    <ControlLabel
      control={<Switch color="primary" />}
      label="Chart presentation JSON"
      onChange={() => setShowPresentationAsJson(!showPresentationAsJson)}
      labelPlacement="end"
    />
  );
};
