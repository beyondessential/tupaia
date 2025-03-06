import React from 'react';
import styled from 'styled-components';
import { Checkbox as BaseCheckbox } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';

const Checkbox = styled(BaseCheckbox)`
  margin: 0 0.56rem;
  .MuiCheckbox-root {
    padding: 0;
    margin-right: 0.5rem;
    &:not(.Mui-checked) {
      color: ${props => props.theme.palette.text.primary};
    }
  }
  .MuiButtonBase-root:has([aria-invalid='true']) {
    color: ${props => props.theme.palette.error.main};
  }
  .MuiFormHelperText-root {
    margin-left: -0.5rem;
    margin-top: 0.25rem;
    font-size: 0.875rem;
  }
`;
export const CheckboxQuestion = ({
  id,
  label,
  name,
  detailLabel,
  required,
  controllerProps: { value, onChange, ref, invalid },
}: SurveyQuestionInputProps) => {
  return (
    <Checkbox
      value="Yes"
      label={label}
      id={id}
      name={name!}
      color="primary"
      required={required}
      checked={value === 'Yes'}
      onChange={e => onChange(e.target.checked ? 'Yes' : 'No')}
      inputRef={ref}
      helperText={detailLabel as string}
      inputProps={{
        'aria-invalid': invalid,
      }}
    />
  );
};
