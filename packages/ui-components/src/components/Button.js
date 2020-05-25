/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';
import PropTypes from 'prop-types';

const StyledButton = styled(MuiButton)`
  font-size: 0.9375rem;
  line-height: 1;
  letter-spacing: 0;
  padding: 1em 1.5em;
  box-shadow: none;
  min-width: 3rem;

  &.MuiButton-contained {
    border: 1px solid transparent; // used to make the contained buttons the same size as the outlined ones
  }

  & ~ .MuiButtonBase-root {
    margin-left: 1rem; // add spacing for adjacent buttons
  }
`;

/*
 * Button
 *
 * Default button is styled as material ui contained with the primary color
 */
export const Button = ({ children, isSubmitting, disabled, ...props }) => (
  <StyledButton variant="contained" color="primary" {...props} disabled={isSubmitting || disabled}>
    {isSubmitting ? 'Loading...' : children}
  </StyledButton>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  isSubmitting: PropTypes.bool,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  isSubmitting: false,
  disabled: false,
};

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
const OutlinedButton = props => <Button {...props} variant="outlined" />;

export const LightOutlinedButton = styled(OutlinedButton)`
  color: ${props => props.theme.palette.common.white};
  border-color: ${props => props.theme.palette.common.white};
  justify-content: space-between;
  padding: 0.8rem 2rem;

  .MuiButton-startIcon {
    margin-right: 0.5rem;

    svg {
      font-size: 1rem;
    }
  }

  &:hover {
    background-color: ${props => props.theme.palette.common.white};
    border-color: ${props => props.theme.palette.common.white};
    color: ${props => props.theme.palette.primary.main};
  }
`;

/*
 * Grey Outline Button
 */
export const GreyOutlinedButton = styled(OutlinedButton)`
  color: ${props => props.theme.palette.text.secondary};
  border: 1px solid ${props => props.theme.palette.grey['400']};
  background: none;
  font-size: 0.75rem;
  padding: 0.8em 1.5em;

  &.Mui-disabled {
    background: #f1f1f1;
    border: none;
  }

  &:hover {
    color: ${props => props.theme.palette.text.secondary};
    border: 1px solid ${props => props.theme.palette.grey['400']};
    background: none;
  }
`;
