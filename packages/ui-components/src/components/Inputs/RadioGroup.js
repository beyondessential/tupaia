/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiRadio from '@material-ui/core/Radio';
import MuiRadioGroup from '@material-ui/core/RadioGroup';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import MuiFormControl from '@material-ui/core/FormControl';
import MuiFormLabel from '@material-ui/core/FormLabel';

const FormControl = styled(MuiFormControl)`
  display: block;
  margin-bottom: 1.2rem;
`;

const FormLabel = styled(MuiFormLabel)`
  position: relative;
  font-size: 0.9375rem;
  line-height: 1.125rem;
  margin-bottom: 0.25rem;
  color: ${props => props.theme.palette.text.secondary};

  &.Mui-focused {
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const StyledRadioGroup = styled(MuiRadioGroup)`
  display: inline-flex;
  flex-direction: row;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  overflow: hidden;
`;

const FormControlLabel = styled(MuiFormControlLabel)`
  padding: 0.6rem 1.2rem 0.6rem 0.6rem;
  margin: 0;
  border-right: 1px solid ${props => props.theme.palette.grey['400']};
  font-size: 1rem;
  line-height: 1.2rem;
  color: ${props => props.theme.palette.text.tertiary};
  background: white;

  .MuiButtonBase-root {
    padding: 0.3rem;
  }

  &:last-child {
    border-right: none;
  }
`;

const Radio = styled(MuiRadio)`
  color: ${props => props.theme.palette.text.tertiary};

  &.Mui-checked {
    color: ${props => props.theme.palette.primary.main};
  }

  .MuiSvgIcon-root {
    font-size: 1.125rem;
  }
`;

export const RadioGroup = ({
  options,
  value,
  onChange,
  label,
  name,
  className,
  labelKey,
  valueKey,
  inputRef,
}) => (
  <FormControl component="fieldset" className={className} color="primary">
    <FormLabel component="legend">{label}</FormLabel>
    <StyledRadioGroup aria-label={name} name={name} value={value} onChange={onChange}>
      {options.map(option => (
        <FormControlLabel
          control={<Radio inputRef={inputRef} />}
          key={option[valueKey].toString()}
          value={option[valueKey]}
          label={option[labelKey]}
        />
      ))}
    </StyledRadioGroup>
  </FormControl>
);

RadioGroup.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
  labelKey: PropTypes.string,
  valueKey: PropTypes.string,
};

RadioGroup.defaultProps = {
  label: null,
  className: null,
  labelKey: 'label',
  valueKey: 'value',
};
