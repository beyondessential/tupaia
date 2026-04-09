import React from 'react';
import styled from 'styled-components';

import { Tooltip } from '@tupaia/ui-components';
import { CodeGeneratorQuestionConfig } from '@tupaia/types';

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
          FormHelperTextProps: { component: InputHelperText },
        }}
        value={displayValue}
      />
    </ArithmeticQuestionWrapper>
  );
};

const CodeGeneratorWrapper = styled(Wrapper)`
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

const useDynamicPrefixHelperText = (
  config: SurveyQuestionInputProps['config'],
  hasValue: boolean,
) => {
  const { formData } = useSurveyForm();

  const dynamicPrefix = (config?.codeGenerator as CodeGeneratorQuestionConfig | undefined)
    ?.dynamicPrefix;
  if (!dynamicPrefix) return null;

  const sourceAnswer = formData[dynamicPrefix.questionId];
  if (!sourceAnswer) {
    return {
      text: 'Answer the prerequisite question to generate a code',
      isWarning: false,
    };
  }

  if (!hasValue) {
    return {
      text: 'Could not generate a code. The selected answer may be missing a required attribute.',
      isWarning: true,
    };
  }

  return null;
};

const WarningHelperText = styled(InputHelperText)`
  &.MuiFormHelperText-root {
    color: ${({ theme }) => theme.palette.error.main};
  }
`;

export const CodeGeneratorQuestion = ({
  label,
  name,
  detailLabel,
  config,
}: SurveyQuestionInputProps) => {
  const { formData } = useSurveyForm();
  const value = name ? formData[name] : null;
  const helperInfo = useDynamicPrefixHelperText(config, Boolean(value));

  const helperText = helperInfo?.text ?? detailLabel;

  return (
    <CodeGeneratorWrapper>
      <TextInput
        disabled
        label={label}
        name={name ?? undefined}
        textInputProps={{
          helperText,
          FormHelperTextProps: { component: WarningHelperText },
        }}
        value={value}
      />
    </CodeGeneratorWrapper>
  );
};
