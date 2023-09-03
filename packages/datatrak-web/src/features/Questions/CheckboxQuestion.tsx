/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Checkbox as BaseCheckbox } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';

const Checkbox = styled(BaseCheckbox)`
  margin: 0 0.56rem;
  .MuiCheckbox-root {
    padding: 0;
    margin-right: 0.5rem;
  }
`;
export const CheckboxQuestion = ({
  id,
  label,
  name,
  controllerProps: { value, onChange, ref },
}: SurveyQuestionInputProps) => {
  return (
    <Checkbox
      value="Yes"
      label={label}
      id={id}
      name={name!}
      checked={value === 'Yes'}
      onChange={e => onChange(e.target.checked ? 'Yes' : 'No')}
      inputRef={ref}
    />
  );
};
