/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ScrollableBody } from '../layout';
import { useSurvey, useSurveyResponse } from '../api/queries';
import { SurveyReviewSection } from '../features/Survey/Components';

const Header = styled.div`
  padding: 1rem;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2rem;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1.375rem 2.75rem;
  }
`;

const PageHeading = styled(Typography).attrs({
  variant: 'h2',
})`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 1rem;
  }
`;

const PageDescription = styled(Typography)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 0.875rem;
  }
`;

export const SurveyResponsePage = () => {
  const { surveyCode, surveyResponseId } = useParams();
  const formContext = useFormContext();
  const { data: survey } = useSurvey(surveyCode);
  const { data } = useSurveyResponse(surveyResponseId);
  const answers = data?.answers || {};

  useEffect(() => {
    if (answers) {
      formContext.reset(answers);
    }
  }, [JSON.stringify(answers)]);

  return (
    <>
      <Header>
        <PageHeading>{survey?.name}</PageHeading>
        <PageDescription>Ba Health Centre | Fiji 02/03/23</PageDescription>
      </Header>
      <ScrollableBody>
        <SurveyReviewSection />
      </ScrollableBody>
    </>
  );
};
