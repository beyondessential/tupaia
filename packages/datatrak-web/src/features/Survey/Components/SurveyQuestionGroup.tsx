/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
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
  return (
    <>
      {questions?.map(
        ({
          id,
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
          if (validationCriteria?.mandatory === true) {
            console.log('mandatory question', code);
          }
          return (
            <QuestionWrapper key={id} $isInstruction={type === 'Instruction'}>
              {questionNumber && (
                <QuestionNumber id={`question_number_${id}`}>{questionNumber}</QuestionNumber>
              )}
              <SurveyQuestion
                detailLabel={detailLabel}
                id={id}
                code={code}
                name={id}
                type={type}
                text={detailLabel || text}
                options={options}
                config={config}
                label={label || text}
                optionSetId={optionSetId}
                updateFormDataOnChange={updateFormDataOnChange}
              />
            </QuestionWrapper>
          );
        },
      )}
    </>
  );
};
