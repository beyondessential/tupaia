/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocation } from 'react-router';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SurveyQuestion } from './SurveyQuestion';
import { SurveyScreenComponent } from '../../../types';

const QuestionWrapper = styled.div<{
  $isInstruction: boolean;
}>`
  display: flex;
  &:not(:last-child) {
    margin-bottom: ${({ $isInstruction }) => ($isInstruction ? '1rem' : '2rem')};
  }
`;

const QuestionNumber = styled(Typography)`
  width: 3.5rem;
  text-transform: lowercase;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  ${({ theme }) => theme.breakpoints.up('md')} {
    font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  }
`;

/**
 * This is the component that renders questions in a survey.
 */
export const SurveyQuestionGroup = ({ questions }: { questions: SurveyScreenComponent[] }) => {
  const { setError, errors } = useFormContext();
  const location = useLocation() as { state: { errors?: string } };

  // Set errors from location state, if any. This is so that we can show errors from the review screen
  useEffect(() => {
    if (location?.state?.errors) {
      const parsedErrors = JSON.parse(location.state.errors);
      Object.entries(parsedErrors).forEach(([questionId, error]) => {
        setError(questionId, error);
      });
    }
  }, [location?.state?.errors]);

  // focus the first error. This is mainly for when the user is directed from the review screen, because we have to manually set them
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0] as {
        ref: {
          focus: () => void;
        };
      };
      if (firstError && firstError?.ref) {
        firstError?.ref?.focus();
      }
    }
  }, [JSON.stringify(errors)]);
  return (
    <>
      {questions?.map(
        ({
          questionId,
          code,
          text,
          type,
          options,
          config,
          label,
          validationCriteria,
          detailLabel,
          optionSetId,
          questionNumber,
          updateFormDataOnChange,
        }) => {
          return (
            <QuestionWrapper key={questionId} $isInstruction={type === 'Instruction'}>
              {type !== 'Instruction' && (
                <QuestionNumber id={`question_number_${questionId}`}>
                  {questionNumber}
                </QuestionNumber>
              )}
              <SurveyQuestion
                detailLabel={'test'}
                id={questionId}
                code={code}
                name={questionId}
                type={type}
                text={text}
                options={options}
                config={config}
                label={label || text}
                optionSetId={optionSetId}
                updateFormDataOnChange={updateFormDataOnChange}
                validationCriteria={validationCriteria}
              />
            </QuestionWrapper>
          );
        },
      )}
    </>
  );
};
