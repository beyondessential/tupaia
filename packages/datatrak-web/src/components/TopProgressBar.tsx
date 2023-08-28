import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';

const Wrapper = styled.div`
  background: rgba(0, 65, 103, 0.3);
  width: 100%;
  min-width: 22.8125rem;
`;

const ProgressBar = styled.div`
  background: ${({ theme }) => theme.progressBar.main}99;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  height: 0.75rem;
  width: 100%;
`;

const ProgressButton = styled(Button)`
  background: ${({ theme }) => theme.palette.primary.main};
  color: white;
  border-radius: 3px;
  text-transform: none;
  font-size: 0.9375rem;
  height: 2.7851875rem;
  padding: 0.8125rem 1.5625rem;
`;

const CancelButton = styled(Button)`
  background-color: white;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.main};
  text-transform: none;
  font-size: 0.9375rem;
  height: 2.7851875rem;
  padding: 0.8125rem 1.5625rem;
`;

const BackButton = styled(Button)`
  text-align: center;
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
  console.log(fraction);
  const [progress, setProgress] = useState(fraction);

  const handleProgressBar = () => {
    if (progress > 99) {
      setProgress(100);
    } else {
      setProgress(progress + fraction);
    }
  };

  const handleCancel = () => {
    setProgress(0);
  };

  const handleProgressBack = () => {
    if (progress < currentSurveyQuestion) {
      setProgress(0);
    } else {
      setProgress(progress - fraction);
    }
  };

  return (
    <>
      <Wrapper>
        <ProgressBar style={{ width: `${progress}%` }} />
      </Wrapper>
      <BackButton onClick={handleProgressBack}>
        <ArrowBackIosRoundedIcon />
        Back
      </BackButton>
      <CancelButton onClick={handleCancel}>Cancel</CancelButton>
      <ProgressButton onClick={handleProgressBar}>Next</ProgressButton>
    </>
  );
};
