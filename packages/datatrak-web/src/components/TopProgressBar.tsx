/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background: rgba(0, 65, 103, 0.3);
  width: 100%;
`;

const ProgressBar = styled.div<{
  $progress: number;
}>`
  background: ${({ theme }) => theme.palette.primary.dark};
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  height: 0.75rem;
  width: ${({ $progress }) => `${$progress}`}%;
`;

interface ProgressPercentage {
  currentSurveyQuestion: number;
  totalNumberOfSurveyQuestions: number;
}

export const TopProgressBar = ({
  currentSurveyQuestion,
  totalNumberOfSurveyQuestions,
}: ProgressPercentage) => {
  const fraction = (currentSurveyQuestion / totalNumberOfSurveyQuestions) * 100;
  console.log('fraction', fraction);
  console.log('currentSurveyQuestion', currentSurveyQuestion);
  console.log('totalNumberOfSurveyQuestions', totalNumberOfSurveyQuestions);

  return (
    <Wrapper>
      <ProgressBar $progress={fraction} />
    </Wrapper>
  );
};
