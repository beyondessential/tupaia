/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { SurveyQuestionInputProps } from '../../types';
import styled from 'styled-components';
import { TextInput } from '../../components';

const Wrapper = styled.div`
  width: 100%;
  .MuiFormControlLabel-root {
    width: calc(100% - 3.5rem);
  }
`;

enum FIELD_TYPES {
  FreeText = 'text',
  Number = 'number',
}

export const TextQuestion = ({
  id,
  label,
  name,
  type,
  controllerProps: { onChange, value, ref },
}: SurveyQuestionInputProps) => {
  return (
    <Wrapper>
      <TextInput
        label={label}
        name={name!}
        ref={ref}
        onChange={onChange}
        value={value}
        textInputProps={{
          ['aria-describedby']: `question_number_${id}`,
          type: FIELD_TYPES[type as FIELD_TYPES],
          placeholder: 'Enter your answer here',
        }}
      />
    </Wrapper>
  );
};
