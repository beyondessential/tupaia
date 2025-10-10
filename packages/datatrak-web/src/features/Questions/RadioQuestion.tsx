import { FormControlLabel, FormLabel, Radio, RadioGroup } from '@material-ui/core';
import React from 'react';
import styled, { css } from 'styled-components';
import { InputHelperText, RadioIcon } from '../../components';
import { SurveyQuestionInputProps } from '../../types';

const StyledRadioGroup = styled(RadioGroup)`
  width: 100%;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
`;

const RadioItem = styled(FormControlLabel)<{
  $color?: string;
}>`
  border: 1px solid ${({ theme }) => theme.palette.text.primary};
  border-radius: 4px;
  background-color: ${({ $color }) => ($color ? `${$color}33` : 'transparent')};
  max-width: 25rem;
  margin-left: 0;
  padding: 0.3rem 0.69rem;
  .MuiFormControlLabel-label {
    font-size: 0.875rem;
  }
  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
  &:has(.Mui-checked) {
    ${({ $color, theme }) => css`
      background-color: color-mix(in oklab, ${theme.palette.primary.main}, transparent 90%);
      background-color: oklch(from ${theme.palette.primary.main} l c h / 10%);
      border-color: ${$color || theme.palette.primary.main};
    `}
  }
  [aria-invalid='true'] & {
    border-color: ${({ theme }) => theme.palette.error.main};
  }
`;

const RadioButton = styled(Radio)<{
  $color?: string;
}>`
  color: ${({ theme }) => theme.palette.text.primary};

  .MuiSvgIcon-root {
    font-size: 1.25rem;
    fill: ${({ $color }) => ($color ? 'white' : 'transparent')};
  }

  [aria-invalid='true'] & {
    .MuiSvgIcon-root circle {
      stroke: ${({ theme }) => theme.palette.error.main};
    }
  }

  &.Mui-checked {
    color: ${({ theme }) => theme.palette.primary.main};

    .MuiSvgIcon-root circle {
      stroke: ${({ theme }) => theme.palette.primary.main};
    }
  }
`;

const LegendWrapper = styled.div`
  margin-bottom: 1rem;
  legend {
    color: ${({ theme }) => theme.palette.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    font-size: 0.875rem;
    line-height: 1.2;
    ${({ theme }) => theme.breakpoints.up('md')} {
      font-size: 1rem;
      font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
    }
  }
`;

export const RadioQuestion = ({
  id,
  label,
  name,
  options,
  required,
  detailLabel,
  controllerProps: { onChange, value, ref, invalid },
}: SurveyQuestionInputProps) => {
  // This is a controlled component because value and onChange are required props
  return (
    <StyledRadioGroup
      aria-describedby={`question_number_${id}`}
      name={name!}
      onChange={e => onChange(e, e.target.value)}
      id={id}
      aria-invalid={invalid}
      value={value || ''}
    >
      {/**replace non-breaking spaces that are returned with the label with normal spaces to prevent unwanted wrapping **/}
      <LegendWrapper>
        <FormLabel component="legend" error={invalid} required={required}>
          {label?.replace(/\xA0/g, ' ')}
        </FormLabel>
        {detailLabel && <InputHelperText>{detailLabel}</InputHelperText>}
      </LegendWrapper>
      {options?.map(({ label, value, color }, i) => (
        <RadioItem
          key={value}
          $color={color}
          value={value}
          ref={ref} // the ref needs to be passed to the radio item so that when an error is caught, focus can be applied to the input. Applying the ref to the div wrapper does not work because the div is not focusable
          control={
            <RadioButton
              $color={color}
              required={required && i === 0}
              icon={<RadioIcon />}
              checkedIcon={<RadioIcon checked optionColor={color} />}
            />
          } // only the first radio button is required, as this is enough to make the whole group required
          label={label}
        />
      ))}
    </StyledRadioGroup>
  );
};
