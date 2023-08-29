/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useFormContext, Controller } from 'react-hook-form';
import { Checkbox as BaseCheckbox } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';

const Checkbox = styled(BaseCheckbox)`
  margin: 0 0.56rem;
  .MuiCheckbox-root {
    padding: 0;
    margin-right: 0.5rem;
  }
`;
export const CheckboxQuestion = ({ id, label, name }: SurveyQuestionInputProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={renderProps => {
        return (
          <Checkbox
            value="Yes"
            label={label}
            id={id}
            inputRef={renderProps.ref}
            name={name}
            checked={renderProps.value === 'Yes'}
            onChange={e => renderProps.onChange(e.target.checked ? 'Yes' : 'No')}
          />
        );
      }}
    />
  );
};
