/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import MuiLink from '@material-ui/core/Link';

const StyledButton = styled(MuiButton)`
  font-size: 0.9375rem;
  line-height: 1.75;
  letter-spacing: 0;
  padding: 0.5em 1.75em;
  box-shadow: none;
  min-width: 3rem;

  &:hover {
    box-shadow: none;
  }

  &.Mui-disabled {
    opacity: 0.8;
    background-color: ${props => props.theme.palette.primary.main};
    color: white;
  }

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
export const Button = ({ children, isLoading, loadingText, disabled, ...props }) => (
  <StyledButton variant="contained" color="primary" {...props} disabled={isLoading || disabled}>
    {isLoading ? `${loadingText}...` : children}
  </StyledButton>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  loadingText: 'Loading',
  isLoading: false,
  disabled: false,
};

export const LightPrimaryButton = styled(Button)`
  background-color: #dceffb;
  color: ${props => props.theme.palette.primary.main};

  &:hover,
  &.Mui-disabled {
    opacity: 0.8;
    background-color: ${props => props.theme.palette.primary.light};
    color: ${props => props.theme.palette.primary.main};
  }
`;

export const GreyButton = styled(Button)`
  background-color: #6f7b82;
  color: ${props => props.theme.palette.common.white};
`;

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
  color: ${props => props.theme.palette.common.white};

  &:hover {
    background-color: ${props => props.theme.palette.warning.dark};
  }

  &.Mui-disabled {
    background-color: ${props => props.theme.palette.warning.main};
    color: white;
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

  &.Mui-disabled {
    background-color: ${props => props.theme.palette.success.main};
    color: white;
  }
`;

/**
 * White background with Grey Border
 */
export const WhiteButton = styled(MuiButton)`
  background: white;
  padding: 0.7rem;
  font-size: 1rem;
  min-height: 3.1rem;
  line-height: 1.2rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
  border: 1px solid ${props => props.theme.palette.grey['400']};

  &:hover {
    border: 1px solid ${props => props.theme.palette.grey['400']};
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
export const OutlinedButton = props => <Button {...props} variant="outlined" />;

export const ErrorOutlinedButton = styled(OutlinedButton)`
  color: ${props => props.theme.palette.error.main};
  border-color: ${props => props.theme.palette.error.main};

  &:hover {
    background-color: rgb(85 65 65 / 4%);
    color: ${props => props.theme.palette.error.main};
    border-color: ${props => props.theme.palette.error.main};
  }
`;

export const LightOutlinedButton = styled(OutlinedButton)`
  color: ${props => props.theme.palette.common.white};
  border-color: ${props => props.theme.palette.common.white};
  justify-content: space-between;
  padding: 0.5rem 2rem;

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

  &.Mui-disabled {
    color: ${props => props.theme.palette.common.white};
    border-color: ${props => props.theme.palette.common.white};
    background: none;
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
  padding: 0.5em 1.5em;

  &.Mui-disabled {
    color: ${props => props.theme.palette.text.secondary};
    background: ${props => props.theme.palette.grey['200']};
    border: 1px solid ${props => props.theme.palette.grey['200']};
  }

  &:hover {
    color: ${props => props.theme.palette.text.secondary};
    border: 1px solid ${props => props.theme.palette.grey['400']};
    background: none;
  }
`;

const StyledLink = styled(MuiLink)`
  text-decoration: underline;
  font-size: 1em;
  line-height: 1.2;
`;

export const LinkButton = ({ children, onClick }) => (
  <StyledLink component="button" onClick={onClick}>
    {children}
  </StyledLink>
);

LinkButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.any.isRequired,
};
