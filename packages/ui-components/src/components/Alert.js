/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiAlert from '@material-ui/lab/Alert';
import styled from 'styled-components';
import { CheckCircle, Warning } from '@material-ui/icons';
import PropTypes from 'prop-types';

const StyledAlert = styled(MuiAlert)`
  border-radius: 0;
  font-weight: 400;
  align-items: center;
  padding: 0.9rem 1.25rem 0.9rem 2.5rem;
  box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.15);

  .MuiAlert-icon {
    margin-right: 0.5rem;
  }
`;

const BaseAlert = props => <StyledAlert variant="filled" {...props} />;

const SuccessAlert = styled(BaseAlert)`
  background: ${props => props.theme.palette.success.main};
  color: white;
`;

const ErrorAlert = styled(BaseAlert)`
  background: ${props => props.theme.palette.error.main};
  color: white;
`;

const LightSuccessAlert = styled(BaseAlert)`
  background: ${props => props.theme.palette.success.light};
  color: ${props => props.theme.palette.success.main};
`;

const LightErrorAlert = styled(BaseAlert)`
  background: ${props => props.theme.palette.error.light};
  color: ${props => props.theme.palette.error.main};
`;

const TYPES = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  ERROR: 'error',
  LIGHT_SUCCESS: 'lightSuccess',
  LIGHT_ERROR: 'lightError',
};

export const Alert = ({ type, ...props }) => {
  if (!type) {
    return <BaseAlert {...props} />;
  }

  const AlertComponents = {
    [TYPES.SUCCESS]: <SuccessAlert icon={<CheckCircle fontSize="inherit" />} {...props} />,
    [TYPES.ERROR]: <ErrorAlert icon={<Warning fontSize="inherit" />} {...props} />,
    [TYPES.LIGHT_SUCCESS]: (
      <LightSuccessAlert icon={<CheckCircle fontSize="inherit" />} {...props} />
    ),
    [TYPES.LIGHT_ERROR]: <LightErrorAlert icon={<Warning fontSize="inherit" />} {...props} />,
  };

  return AlertComponents[type];
};

Alert.propTypes = {
  type: PropTypes.PropTypes.oneOf(Object.values(TYPES)),
};

Alert.defaultProps = {
  type: null,
};

const BaseSmallAlert = styled(BaseAlert)`
  font-size: 0.8125rem;
  border-radius: 3px;
  padding: 0.5rem 1.25rem 0.5rem 1rem;
  box-shadow: none;

  .MuiAlert-icon {
    padding: 0.5rem 0;
    margin-right: 0.5rem;
    font-size: 1.5em;
  }
`;

const SmallSuccessAlert = styled(BaseSmallAlert)`
  background: ${props => props.theme.palette.success.main};
  color: white;
`;

const SmallErrorAlert = styled(BaseSmallAlert)`
  background: ${props => props.theme.palette.error.main};
  color: white;
`;

const SmallLightSuccessAlert = styled(BaseSmallAlert)`
  background: ${props => props.theme.palette.success.light};
  color: ${props => props.theme.palette.success.main};
`;

const SmallLightErrorAlert = styled(BaseSmallAlert)`
  background: ${props => props.theme.palette.error.light};
  color: ${props => props.theme.palette.error.main};
`;

export const SmallAlert = ({ type, ...props }) => {
  if (!type) {
    return <BaseSmallAlert {...props} />;
  }

  const AlertComponents = {
    [TYPES.SUCCESS]: <SmallSuccessAlert icon={<CheckCircle fontSize="inherit" />} {...props} />,
    [TYPES.ERROR]: <SmallErrorAlert icon={<Warning fontSize="inherit" />} {...props} />,
    [TYPES.LIGHT_SUCCESS]: (
      <SmallLightSuccessAlert icon={<CheckCircle fontSize="inherit" />} {...props} />
    ),
    [TYPES.LIGHT_ERROR]: <SmallLightErrorAlert icon={<Warning fontSize="inherit" />} {...props} />,
  };

  return AlertComponents[type];
};

SmallAlert.propTypes = {
  type: PropTypes.oneOf(Object.values(TYPES)),
};

SmallAlert.defaultProps = {
  type: null,
};
