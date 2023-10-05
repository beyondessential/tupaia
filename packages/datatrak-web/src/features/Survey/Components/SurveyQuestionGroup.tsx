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
          questionCode,
          questionText,
          questionType,
          questionOptions,
          config,
          questionLabel,
          validationCriteria,
          detailLabel,
          questionOptionSetId,
          questionNumber,
          updateFormDataOnChange,
        }) => {
          return (
            <QuestionWrapper key={questionId} $isInstruction={questionType === 'Instruction'}>
              {questionNumber && (
                <QuestionNumber id={`question_number_${questionId}`}>
                  {questionNumber}
                </QuestionNumber>
              )}
              <SurveyQuestion
                detailLabel={detailLabel}
                id={questionId}
                code={questionCode}
                name={questionId}
                type={questionType}
                text={detailLabel || questionText}
                options={questionOptions}
                config={config}
                label={questionLabel || questionText}
                optionSetId={questionOptionSetId}
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
