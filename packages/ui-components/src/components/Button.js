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
  font-size: 0.9375rem; // maybe move this to theme
  line-height: 1; // maybe move this to theme
  letter-spacing: 0; // maybe move this to theme
  padding: 1em 1.5em;
  min-width: 8em;
  box-shadow: none;
`;

/*
 * Button
 *
 * Default button is styled as material ui contained with the primary color
 */
export const Button = ({ children, isSubmitting = false, disabled, ...props }) => (
  <StyledButton variant="contained" color="primary" {...props} disabled={isSubmitting}>
    {isSubmitting ? 'Loading...' : children}
  </StyledButton>
);

/*
 * Text Button
 */
export const TextButton = styled(MuiButton)`
  font-size: 0.8125rem;
  font-weight: 400;
`;

/*
 * Warning Button
 */
export const WarningButton = styled(Button)`
  background-color: ${props => props.theme.palette.warning.main};

  &:hover {
    background-color: ${props => props.theme.palette.warning.dark};
  }
`;

/*
 * Success Button
 */
export const SuccessButton = styled(Button)`
  background-color: ${props => props.theme.palette.success.main};

  &:hover {
    background-color: ${props => props.theme.palette.success.dark};
  }
`;

/*
 * Small Button
 */
export const SmallButton = styled(Button)`
  font-size: 0.75rem;
`;

/*
 * Light Outlined Button
 */
export const LightOutlinedButton = styled(props => <Button {...props} variant="outlined" />)`
  color: ${COLORS.WHITE};
  border-color: ${COLORS.GREY_DE};
  justify-content: space-between;
  padding: 0.5rem 1rem;

  .MuiButton-endIcon {
    margin-left: 1.5rem;
    margin-right: 0;
  }

  &:hover {
    background-color: ${COLORS.WHITE};
    border-color: ${COLORS.WHITE};
    color: ${props => props.theme.palette.primary.main};
  }
`;

/*
 * Light Outlined Button
 */
export const ProfileButton = styled(props => (
  <MuiButton endIcon={<ExpandMore />} startIcon={<Avatar />} {...props} />
))`
  color: ${COLORS.WHITE};

  .MuiAvatar-root {
    height: 30px;
    width: 30px;
    color: white;
  }
`;
