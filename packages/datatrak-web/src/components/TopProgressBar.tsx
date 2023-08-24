import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import ArrowBackIosNewRounded from '@material-ui/icons/ArrowBackIosNewRoundedIcon';

const ProgressBar = styled.div`
  background-color: blue;
  height: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ProgressButton = styled(Button)`
  background-color: ${({ theme }) => theme.palette.primary.main};
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
  background-color: red;
`;

export const TopProgressBar = () => {
  const [progressBar, setProgressBar] = useState(0);

  const handleProgressBar = () => {
    if (progressBar < 100) {
      setProgressBar(progressBar + 6.25);
    }
  };

  const handleNonProgressBar = () => {
    if (progressBar === 0) {
      setProgressBar(0);
    } else {
      setProgressBar(progressBar - 6.25);
    }
  };

  return (
    <>
      <ProgressBar style={{ width: `${progressBar}%` }} />
      <BackButton onClick={handleNonProgressBar}>
        <ArrowBackIosNewRounded></ArrowBackIosNewRounded>Back
      </BackButton>
      <CancelButton>Cancel</CancelButton>
      <ProgressButton onClick={handleProgressBar}>Next</ProgressButton>
    </>
  );
};
