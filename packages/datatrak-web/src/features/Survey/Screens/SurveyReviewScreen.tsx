/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { formatSurveyScreenQuestions } from '../utils';
import { useSurveyForm } from '../SurveyContext';
import { SurveyQuestionGroup } from '../Components';
import { ScrollableBody } from '../../../layout';

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

export const SurveyReviewScreen = () => {
  const { visibleScreens } = useSurveyForm();
  if (!visibleScreens || !visibleScreens.length) return null;

  // split the questions into sections by screen so it's easier to read the long form
  const questionSections = visibleScreens.map((screenComponents, i) => {
    const screenNumber = i + 1;
    const heading = screenComponents[0].text;
    const firstQuestionIsInstruction = screenComponents[0].type === 'Instruction';

    // if the first question is an instruction, don't display it, because it will be displayed as the heading
    const questionsToDisplay = firstQuestionIsInstruction
      ? screenComponents.slice(1)
      : screenComponents;
    return {
      heading,
      questions: formatSurveyScreenQuestions(questionsToDisplay, screenNumber),
    };
  });

  return (
    <>
      <Header>
        <PageHeading>Review and submit</PageHeading>
        <PageDescription>
          Please review your survey answers below. To edit any answers, please navigate back using
          the 'Back' button below. Once submitted, your survey answers will be uploaded to Tupaia.{' '}
        </PageDescription>
      </Header>
      <ScrollableBody>
        <Fieldset>
          {questionSections.map(({ heading, questions }, index) => (
            <Section key={index}>
              <SectionHeader>{heading}</SectionHeader>
              <SurveyQuestionGroup questions={questions} />
            </Section>
          ))}
        </Fieldset>
      </ScrollableBody>
    </>
  );
};
