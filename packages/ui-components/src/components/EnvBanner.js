/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import GitHubIcon from '@material-ui/icons/GitHub';
import { FlexCenter } from './Layout';

const StyledBanner = styled(FlexCenter)`
  background: ${props => props.$color};
  color: white;
  font-size: 13px;
  font-weight: 500;
  padding: 12px;
  text-align: center;

  .MuiSvgIcon-root {
    font-size: 16px;
    margin-right: 0.4rem;
  }
`;

export const EnvBanner = ({ color }) => {
  const branch = process.env.REACT_APP_BRANCH;

  if (!branch || typeof branch !== 'string' || branch === 'master' || branch === 'main') {
    return null;
  }

  return (
    <StyledBanner $color={color}>
      <GitHubIcon />
      {branch}
    </StyledBanner>
  );
};

EnvBanner.propTypes = {
  color: PropTypes.string,
};

EnvBanner.defaultProps = {
  color: '#f39c12',
};
