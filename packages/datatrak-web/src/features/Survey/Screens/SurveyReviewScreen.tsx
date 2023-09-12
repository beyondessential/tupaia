/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useSurveyForm } from '../SurveyContext';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { formatSurveyScreenQuestions } from '../utils';
import { SurveyQuestionGroup } from '../Components';
import { ScrollableBody } from '../../../layout';

const Header = styled.div`
  padding: 1.375rem 2.75rem;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const Section = styled.section`
  padding: 1rem 0;
`;

const SectionHeader = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1.125rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-bottom: 1rem;
`;

export const SurveyReviewScreen = () => {
  const { surveyScreenComponents } = useSurveyForm();
  if (!surveyScreenComponents) return null;

  // split the questions into sections by screen so it's easier to read the long form
  const questionSections = Object.entries(surveyScreenComponents!).map(
    ([screenNumber, screenComponents]) => {
      const heading = screenComponents[0].questionText;
      return {
        heading,
        questions: formatSurveyScreenQuestions(screenComponents, screenNumber),
      };
    },
  );

  return (
    <>
      <Header>
        <Typography variant="h2">Review and submit</Typography>
        <Typography>
          Please review your survey answers below. To edit any answers, please navigate back using
          the 'Back' button below. Once submitted, your survey answers will be uploaded to Tupaia.{' '}
        </Typography>
      </Header>
      <ScrollableBody as="form" noValidate>
        {questionSections.map(({ heading, questions }, index) => (
          <Section key={index}>
            <SectionHeader>{heading}</SectionHeader>
            <SurveyQuestionGroup questions={questions} />
          </Section>
        ))}
      </ScrollableBody>
    </>
  );
};
