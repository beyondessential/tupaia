import React from 'react';
import styled from 'styled-components';

import { useSurveyForm } from '..';
import { SurveyQuestionInputProps } from '../../types';
import { TextInput } from '../../components';

const Wrapper = styled.div`
  inline-size: 100%;
  border-block-start: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.divider};
  flex-direction: column;
  inline-size: 100%;
  justify-content: center;
  padding-block: 1.8rem 0.8rem;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-block: 1rem;
  }

  .MuiFormControl-root,
  .MuiFormControlLabel-root {
    inline-size: 100%;
  }

  .MuiFormControl-root {
    flex-direction: column-reverse; // Make helper helper text appear above input
  }

  .MuiInputBase-root.Mui-disabled {
    color: inherit;
  }

  .MuiInput-underline.Mui-disabled::before {
    border-block-end: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  }
`;

interface ReadOnlyQuestionInputProps extends SurveyQuestionInputProps {
  className?: string;
}

export const ReadOnlyQuestion = ({
  label,
  name,
  detailLabel,
  className,
}: ReadOnlyQuestionInputProps) => {
  const { formData } = useSurveyForm();

  return (
    <Wrapper className={className}>
      <TextInput
        disabled
        label={label}
        name={name ?? undefined}
        textInputProps={{ helperText: detailLabel }}
        value={name ? formData[name] : null}
      />
    </Wrapper>
  );
};

export const CodeGeneratorQuestion = styled(ReadOnlyQuestion)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-top: 0;
    border-width: 0 0 1px;
  }
`;
