/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { QuestionType } from '@tupaia/types';
import { SurveyQuestionGroup } from './SurveyQuestionGroup.tsx';
import { useSurveyForm } from '../SurveyContext';
import { formatSurveyScreenQuestions, getSurveyScreenNumber } from '../utils';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

const Section = styled.section`
  padding: 1rem 0;
  &:first-child {
    padding-top: 0;
  }
`;

const SectionHeader = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-bottom: 1rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    font-size: 1.125rem;
  }
`;

const Fieldset = styled.fieldset.attrs({
  disabled: true,
})`
  border: none;
  margin: 0;
  padding: 0;
  input,
  label,
  button,
  .MuiInputBase-root,
  link {
    pointer-events: none;
  }
`;
export const SurveyReviewSection = () => {
  const { visibleScreens } = useSurveyForm();

  if (!visibleScreens || !visibleScreens.length) {
    return null;
  }

  // split the questions into sections by screen so it's easier to read the long form
  const questionSections = visibleScreens.map(screen => {
    const { surveyScreenComponents } = screen;
    const screenNumber = getSurveyScreenNumber(visibleScreens, screen);
    const heading = surveyScreenComponents[0].text;
    const firstQuestionIsInstruction = surveyScreenComponents[0].type === QuestionType.Instruction;

    // if the first question is an instruction, don't display it, because it will be displayed as the heading
    const questionsToDisplay = firstQuestionIsInstruction
      ? surveyScreenComponents.slice(1)
      : surveyScreenComponents;
    return {
      heading,
      questions: formatSurveyScreenQuestions(questionsToDisplay, screenNumber),
    };
  });
  return (
    <Fieldset>
      {questionSections.map(({ heading, questions }, index) => (
        <Section key={index}>
          <SectionHeader>{heading}</SectionHeader>
          <SurveyQuestionGroup questions={questions} />
        </Section>
      ))}
    </Fieldset>
  );
};
