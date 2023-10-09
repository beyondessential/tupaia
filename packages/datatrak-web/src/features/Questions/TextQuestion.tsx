/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { SurveyQuestionInputProps } from '../../types';
import styled from 'styled-components';
import { TextInput } from '../../components';
import { MOBILE_BREAKPOINT } from '../../constants';
import { useSurveyForm } from '..';

const Wrapper = styled.div<{
  $type?: string;
}>`
  width: calc(100% - 3.5rem);
  .MuiFormControlLabel-root {
    width: 100%;
  }
  .MuiFormControl-root {
    max-width: ${({ $type }) => ($type === 'Number' ? '25rem' : 'none')};
  }
  .MuiFormControlLabel-label {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    @media (min-width: ${MOBILE_BREAKPOINT}) {
      font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
    }
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
  required,
  min,
  max,
  controllerProps: { onChange, value = '', ref, invalid },
}: SurveyQuestionInputProps) => {
  const { isReviewScreen } = useSurveyForm();
  const placeholder = isReviewScreen ? '' : 'Enter your answer here';
  return (
    <Wrapper $type={type}>
      <TextInput
        label={label}
        name={name!}
        ref={ref}
        onChange={onChange}
        value={value}
        textInputProps={{
          ['aria-describedby']: `question_number_${id}`,
          type: FIELD_TYPES[(type as unknown) as FIELD_TYPES],
          placeholder,
          error: invalid,
          required,
          min,
          max,
          multiline: type === 'FreeText',
        }}
      />
    </Wrapper>
  );
};
