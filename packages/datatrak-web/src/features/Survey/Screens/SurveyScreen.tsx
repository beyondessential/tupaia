/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { useSurveyForm } from '../SurveyContext';
import { SurveyQuestionGroup } from '../Components';
import { ScrollableBody } from '../../../layout';

const ScreenHeading = styled(Typography)`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
`;

/**
 * This is the component that renders survey questions.
 */
export const SurveyScreen = () => {
  const { displayQuestions, screenHeader } = useSurveyForm();

  return (
    <ScrollableBody>
      <ScreenHeading variant="h2">{screenHeader}</ScreenHeading>
      <SurveyQuestionGroup questions={displayQuestions} />
    </ScrollableBody>
  );
};
