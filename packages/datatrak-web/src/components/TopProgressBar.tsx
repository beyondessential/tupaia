import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';

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

/*
Styling of buttons as the project progresses.

const ProgressButton = styled(Button).attrs({
  color: 'primary',
})`
  background: ${({ theme }) => theme.palette.primary.main};
  color: white;
  border-radius: 3px;
  text-transform: none;
  font-size: 0.9rem;
  height: 2.8rem;
  padding: 0.8rem 1.6rem;
`;

const CancelButton = styled(Button).attrs({
  variant: 'outlined',
  color: 'primary',
})`
  border-radius: 3px;
  text-transform: none;
  font-size: 0.9rem;
  height: 2.8rem;
  padding: 0.8rem 1.6rem;
`;

const BackButton = styled(Button)`
  text-align: center;
`;
*/

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
