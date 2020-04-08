/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Avatar from '@material-ui/core/Avatar';
import * as COLORS from '../theme/colors';

const StyledButton = styled(MuiButton)`
  padding: 0.5rem 1.5rem;
  min-width: 120px;
`;

export const Button = ({ children, isSubmitting = false, disabled, ...props }) => (
  <StyledButton variant="contained" color="primary" {...props} disabled={isSubmitting}>
    {isSubmitting ? 'Loading...' : children}
  </StyledButton>
);

/*
 * Light Outlined Button
 */
export const LightOutlinedButton = styled(props => <Button {...props} variant="outlined" />)`
  color: ${COLORS.WHITE};
  border-color: ${COLORS.GREY_DE};
  justify-content: space-between;
  padding: 8px 15px;

  .MuiButton-endIcon {
    margin-left: 25px;
    margin-right: 0;
  }

  &:hover {
    background-color: ${COLORS.WHITE};
    border-color: ${COLORS.WHITE};
    color: ${COLORS.BLUE};
  }
`;

export const ProfileButton = styled(props => (
  <MuiButton endIcon={<ExpandMore />} startIcon={<Avatar />} {...props} />
))`
  color: ${COLORS.WHITE};
  
  .MuiAvatar-root {
    height: 30px;
    width: 30px;
    color: white;
  }

 
  &:hover {
    //background-color: ${COLORS.WHITE};
    //border-color: ${COLORS.WHITE};
    //color: ${COLORS.BLUE};
  }
`;
