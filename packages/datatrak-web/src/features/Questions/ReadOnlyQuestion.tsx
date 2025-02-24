import React from 'react';
import styled from 'styled-components';

import { Tooltip } from '@tupaia/ui-components';

import { useSurveyForm } from '..';
import { SurveyQuestionInputProps } from '../../types';
import { InputHelperText, TextInput } from '../../components';
import { getArithmeticDisplayAnswer } from '../Survey';

const Wrapper = styled.div`
  border-block-start: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.divider};
  flex-direction: column;
  inline-size: 100%;
  justify-content: center;

  padding-block-start: 2rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-block-start: 1rem;
  }

  .MuiFormControlLabel-root,
  .MuiFormControl-root {
    inline-size: 100%;
  }

  .MuiFormControl-root {
    margin-block-start: 0.5rem;
    flex-direction: column-reverse; // Make helper helper text appear above input
  }

  .MuiInputBase-root.Mui-disabled {
    color: inherit;
  }

  .MuiInput-underline.Mui-disabled::before {
    border-block-end: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  }
`;

interface ReadOnlyQuestionProps extends SurveyQuestionInputProps {
  className?: string;
}

export const ReadOnlyQuestion = ({
  label,
  name,
  detailLabel,
  className,
}: ReadOnlyQuestionProps) => {
  const { formData } = useSurveyForm();

  return (
    <Wrapper className={className}>
      <TextInput
        disabled
        label={label}
        name={name ?? undefined}
        textInputProps={{
          helperText: detailLabel,
          FormHelperTextProps: { component: InputHelperText },
        }}
        value={name ? formData[name] : null}
      />
    </Wrapper>
  );
};

export const ArithmeticQuestionWrapper = styled(Wrapper)`
  .MuiInput-root {
    font-variant-numeric: lining-nums tabular-nums;
    font-weight: 700;
  }
`;
export const ArithmeticQuestion = ({
  label,
  name,
  detailLabel,
  config,
}: SurveyQuestionInputProps) => {
  const { formData } = useSurveyForm();
  const rawValue = name ? formData[name] : null;
  const displayValue = getArithmeticDisplayAnswer(config, rawValue, formData);

  return (
    <ArithmeticQuestionWrapper>
      <TextInput
        disabled
        label={
          <Tooltip title="Complete questions above to calculate" enterDelay={1000}>
            <span>{label}</span>
          </Tooltip>
        }
        name={name ?? undefined}
        textInputProps={{
          helperText: detailLabel,
          FormHelperTextProps: {
            component: InputHelperText,
          },
        }}
        value={displayValue}
      />
    </ArithmeticQuestionWrapper>
  );
};

export const CodeGeneratorQuestion = styled(ReadOnlyQuestion)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    border-block-start: none;
  }

  .MuiInput-root {
    font-feature-settings:
      'cpsp' on,
      'ss06' on,
      'ss07' on;
    font-weight: 500;
  }
`;
