import React from 'react';
import styled from 'styled-components';
import { FormLabel } from '@material-ui/core';
import MuiRadio, { RadioProps } from '@material-ui/core/Radio';
import MuiRadioGroup, { RadioGroupProps as MuiRadioGroupProps } from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import MuiFormControl, { FormControlProps } from '@material-ui/core/FormControl';
import { OverrideableComponentProps } from '../../types';
import { InputLabel } from './InputLabel';

const FormControl = styled(MuiFormControl)<OverrideableComponentProps<FormControlProps>>`
  display: block;
  margin-bottom: 1.2rem;
  max-width: max-content;
`;

const Legend = styled(FormLabel).attrs({
  component: 'legend',
})`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  color: ${props => props.theme.palette.text.secondary};
  padding-inline-start: 0;
  &.Mui-focused {
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const StyledRadioGroup = styled(MuiRadioGroup)`
  display: inline-flex;
  flex-direction: row;
  overflow: hidden;
  justify-content: space-between;
`;

const FormControlLabel = styled(MuiFormControlLabel)`
  padding: 0.5rem 1.2rem 0.5rem 0.6rem;
  margin: 0;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  min-width: 0;

  .MuiButtonBase-root {
    padding: 0.3rem;
  }

  & + & {
    margin-left: 0.625rem;
  }
  &.error {
    border-color: ${props => props.theme.palette.error.main};
  }
`;

const Radio = styled(MuiRadio)<
  RadioProps & {
    inputProps: React.HTMLAttributes<HTMLInputElement>;
  }
>`
  color: ${props => props.theme.palette.text.tertiary};

  &.Mui-checked {
    color: ${props => props.theme.palette.primary.main};
  }

  .MuiSvgIcon-root {
    font-size: 1rem;
  }
  .error & {
    color: ${props => props.theme.palette.error.main};
  }
`;

interface RadioGroupProps {
  onChange: MuiRadioGroupProps['onChange'];
  value: string | boolean;
  name: string;
  options: Record<string, any>[];
  label?: string;
  className?: string;
  labelKey?: string;
  valueKey?: string;
  tooltipKey?: string;
  tooltip?: string;
  helperText?: string;
  id?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  inputProps?: React.HTMLAttributes<HTMLInputElement>;
  required?: boolean;
  radioGroupProps?: MuiRadioGroupProps;
  error?: boolean;
}

export const RadioGroup = ({
  options,
  value,
  onChange,
  label,
  name,
  className,
  labelKey = 'label',
  valueKey = 'value',
  tooltipKey = 'tooltip',
  tooltip,
  helperText,
  id,
  inputRef,
  inputProps,
  required,
  error,
  radioGroupProps,
}: RadioGroupProps) => {
  return (
    <FormControl
      component="fieldset"
      className={className}
      color="primary"
      id={id}
      required={required}
      error={error}
    >
      <InputLabel
        label={label}
        as={Legend}
        tooltip={tooltip}
        labelProps={{
          error,
          required,
        }}
        applyWrapper
      />

      {helperText && <FormHelperText id={`${name}-helperText`}>{helperText}</FormHelperText>}
      <StyledRadioGroup name={name} value={value} onChange={onChange} {...radioGroupProps}>
        {options.map((option, i) => (
          <FormControlLabel
            control={
              <Radio
                inputRef={inputRef}
                inputProps={{
                  'aria-describedby': helperText ? `${name}-helperText` : undefined,
                  ...(inputProps || {}),
                  required: required && i === 0, // only the first radio button is required for a radio group if it is required
                }}
              />
            }
            key={option[valueKey].toString()}
            value={option[valueKey]}
            label={<InputLabel label={option[labelKey]} tooltip={option[tooltipKey]} as="span" />}
            className={error ? 'error' : undefined}
          />
        ))}
      </StyledRadioGroup>
    </FormControl>
  );
};
