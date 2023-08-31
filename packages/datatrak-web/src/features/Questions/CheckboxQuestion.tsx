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
  controllerProps,
}: SurveyQuestionInputProps) => {
  return (
    <Checkbox
      {...controllerProps}
      value="Yes"
      label={label}
      id={id}
      name={name!}
      checked={controllerProps.value === 'Yes'}
      onChange={e => controllerProps.onChange(e.target.checked ? 'Yes' : 'No')}
    />
  );
};
