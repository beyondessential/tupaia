import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background: rgba(0, 65, 103, 0.3);
  width: 100%;
  min-width: 22.8rem;
`;

const ProgressBar = styled.div<{
  $progress: number;
}>`
  background: ${({ theme }) => theme.progressBar.main};
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

  return (
    <Wrapper>
      <ProgressBar $progress={fraction} />
    </Wrapper>
  );
};
