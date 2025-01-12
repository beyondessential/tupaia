import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { QuestionType } from '@tupaia/types';
import { useSurveyForm } from '../SurveyContext';
import {
  SurveyPaginator,
  SurveyQuestionGroup,
  MobileSurveyHeader,
  MobileSurveyMenu,
} from '../Components';
import { ScrollableBody } from '../../../layout';
import { useIsMobile } from '../../../utils';

const ScreenHeader = styled.div<{
  $centered?: boolean;
}>`
  margin-block-end: 1rem;
  padding: 0.5rem 0;

  /* 
   * Ensure that vertical centring when there are no questions to display, by targeting the warpper
   * of this element
   */
  ${ScrollableBody}:has(> &) {
    justify-content: ${({ $centered }) => ($centered ? 'center' : 'flex-start')};
  }
`;

const Heading = styled(Typography).attrs({ variant: 'h2' })`
  font-size: 1rem;
  font-weight: 500;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    font-size: 1.25rem;
  }
`;

/**
 * This is the component that renders survey questions.
 */
export const SurveyScreen = () => {
  const {
    displayQuestions,
    screenHeader: instructionHeading,
    screenDetail: instructionDetail,
    activeScreen,
  } = useSurveyForm();
  const isMobile = useIsMobile();

  const pageHasOnlyInstructions = activeScreen.every(
    question => question.type === QuestionType.Instruction,
  );

  const firstQuestionIsInstruction =
    pageHasOnlyInstructions || activeScreen[0].type === QuestionType.Instruction;

  return (
    <>
      {isMobile && <MobileSurveyHeader />}
      <ScrollableBody $hasSidebar>
        {/*
         * If the first question on the active screen is an instruction, then display it in full
         * (heading and detail). Otherwise, display only its heading without its detail; any detail
         * it has will appear with the question itself.
         */}
        <ScreenHeader $centered={pageHasOnlyInstructions}>
          <Heading>{instructionHeading}</Heading>
          {firstQuestionIsInstruction && instructionDetail && (
            <Typography variant="subtitle1">{instructionDetail}</Typography>
          )}
        </ScreenHeader>
        <SurveyQuestionGroup questions={displayQuestions} />
      </ScrollableBody>
      {isMobile ? <MobileSurveyMenu /> : <SurveyPaginator />}
    </>
  );
};
