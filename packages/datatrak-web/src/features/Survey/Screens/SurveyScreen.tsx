/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { useSurveyForm } from '../SurveyContext';
import { SurveyPaginator, SurveyQuestionGroup } from '../Components';
import { ScrollableBody } from '../../../layout';
import { QuestionType } from '@tupaia/types';

const ScreenHeading = styled(Typography)<{
  $centered?: boolean;
}>`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    font-size: 1.25rem;
  }
  // This is to ensure that the text is centered when there are no questions to display, by targeting the div that wraps the text
  div:has(> &) {
    justify-content: ${({ $centered }) => ($centered ? 'center' : 'flex-start')};
  }
`;

/**
 * This is the component that renders survey questions.
 */
export const SurveyScreen = () => {
  const { displayQuestions, screenHeader, activeScreen } = useSurveyForm();

  return (
    <>
      <ScrollableBody $hasSidebar>
        <ScreenHeading
          variant="h2"
          $centered={activeScreen.every(question => question.type === QuestionType.Instruction)}
        >
          {screenHeader}
        </ScreenHeading>
        <SurveyQuestionGroup questions={displayQuestions} />
      </ScrollableBody>
      <SurveyPaginator />
    </>
  );
};
