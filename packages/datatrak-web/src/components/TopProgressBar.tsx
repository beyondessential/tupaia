import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';

const ProgressBar = styled.div`
  background: ${({ theme }) => theme.palette.primary.main};
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  height: 0.75rem;
  &:before {
    content: red;
    background-color: red;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    height: 0.75rem;
  }
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

export const TopProgressBar = ({}: // currentSurveyQuestion,
// totalNumberOfSurveyQuestions,
ProgressPercentage) => {
  const fraction = 16 / 100;
  const [progress, setProgress] = useState(fraction);

  const handleProgressBar = () => {
    setProgress(progress + fraction);
  };

  const handleCancel = () => {
    setProgress(0);
  };

  const handleNonProgressBar = () => {
    if (progress === 0) {
      setProgress(0);
    } else {
      setProgress(progress - fraction);
    }
  };

  return (
    <>
      <ProgressBar style={{ width: `${progress}%` }} />
      <BackButton onClick={handleNonProgressBar}>
        <ArrowBackIosRoundedIcon />
        Back
      </BackButton>
      <CancelButton onClick={handleCancel}>Cancel</CancelButton>
      <ProgressButton onClick={handleProgressBar}>Next</ProgressButton>
    </>
  );
};
