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

  ${({ theme }) => theme.breakpoints.down('xs')} {
    height: 0.4rem;
  }
`;

interface ProgressPercentage {
  currentSurveyQuestion?: number | null;
  totalNumberOfSurveyQuestions: number;
}

export const TopProgressBar = ({
  currentSurveyQuestion,
  totalNumberOfSurveyQuestions,
}: ProgressPercentage) => {
  if (!currentSurveyQuestion) return null;
  const fraction = (currentSurveyQuestion / totalNumberOfSurveyQuestions) * 100;

  return (
    <Wrapper>
      <ProgressBar $progress={fraction} />
    </Wrapper>
  );
};
