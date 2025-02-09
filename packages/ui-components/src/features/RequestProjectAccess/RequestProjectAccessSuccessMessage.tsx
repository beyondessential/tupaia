import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { CheckCircle } from '@material-ui/icons';

const SuccessWrapper = styled.div`
  display: flex;
  margin-block: 1.5rem 7rem;
  p:first-child {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-bottom: 0.5rem;
  }
  p:last-child {
    font-size: 0.875rem;
  }

  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-block-start: 50%;
    margin-block-end: 0;

    .MuiSvgIcon-root,
    .MuiTypography-root {
      margin-bottom: 1rem;
    }
  }
`;

const SuccessIcon = styled(CheckCircle)`
  color: ${({ theme }) => theme.palette.success.main};
  font-size: 2rem;
  margin-inline-end: 1rem;
`;

export const RequestProjectAccessSuccessMessage = ({ projectName }: { projectName?: string }) => {
  return (
    <SuccessWrapper>
      <SuccessIcon />
      <div>
        <Typography>Thank you for your request to {projectName}</Typography>
        <Typography>
          We will review your application and respond by email shortly. Please note, this can take
          some time to process as requests require formal permission to be granted
        </Typography>
      </div>
    </SuccessWrapper>
  );
};
