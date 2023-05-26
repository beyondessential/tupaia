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
import FormHelperText from '@material-ui/core/FormHelperText';
import { InputLabel } from './InputLabel';

const FormControl = styled(MuiFormControl)`
  display: block;
  margin-bottom: 1.2rem;
`;

const Legend = styled.legend`
  position: relative;
  font-size: 0.9375rem;
  line-height: 1.125rem;
  margin-bottom: 0.25rem;
  color: ${props => props.theme.palette.text.secondary};
  padding-inline-start: 0;
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
  tooltipKey,
  tooltip,
  helperText,
}) => (
  <FormControl component="fieldset" className={className} color="primary">
    <InputLabel as={Legend} label={label} tooltip={tooltip} />
    {helperText && <FormHelperText id={`${name}-helperText`}>{helperText}</FormHelperText>}
    <StyledRadioGroup name={name} value={value} onChange={onChange}>
      {options.map(option => (
        <FormControlLabel
          control={
            <Radio
              InputProps={{
                'aria-describedby': helperText ? `${name}-helperText` : null,
              }}
            />
          }
          key={option[valueKey].toString()}
          value={option[valueKey]}
          label={<InputLabel label={option[labelKey]} tooltip={option[tooltipKey]} />}
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
  tooltipKey: PropTypes.string,
  tooltip: PropTypes.string,
  helperText: PropTypes.string,
};

RadioGroup.defaultProps = {
  label: null,
  className: null,
  labelKey: 'label',
  valueKey: 'value',
  tooltipKey: 'tooltip',
  tooltip: '',
  helperText: '',
};
