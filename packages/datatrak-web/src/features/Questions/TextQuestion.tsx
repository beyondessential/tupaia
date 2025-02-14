import React from 'react';
import styled from 'styled-components';
import { SurveyQuestionInputProps } from '../../types';
import { TextInput, InputHelperText } from '../../components';
import { DESKTOP_BREAKPOINT } from '../../constants';
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
    display: flex;
    flex-direction: column-reverse; // make the helper text appear above the input
  }
  .MuiFormControlLabel-label {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    @media (min-width: ${DESKTOP_BREAKPOINT}) {
      font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
    }
  }

  @media screen and (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    width: 100%;
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
  detailLabel,
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
        onChange={e => onChange(e, (e.target as HTMLInputElement).value)}
        value={value}
        required={required}
        invalid={invalid}
        textInputProps={{
          ['aria-describedby']: `question_number_${id}`,
          type: FIELD_TYPES[type as unknown as FIELD_TYPES],
          placeholder,
          min,
          max,
          multiline: type === 'FreeText',
          helperText: detailLabel,
          FormHelperTextProps: {
            component: InputHelperText,
          },
        }}
      />
    </Wrapper>
  );
};
