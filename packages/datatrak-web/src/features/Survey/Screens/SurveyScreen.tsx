import React from 'react';
import styled from 'styled-components';
import { BOTTOM_NAVIGATION_HEIGHT_SMALL } from '../../../constants';
import { useIsMobile } from '../../../utils';
import {
  MobileSurveyHeader,
  MobileSurveyMenu,
  SurveyPaginator,
  SurveyQuestionGroup,
} from '../Components';
import { useSurveyForm } from '../SurveyContext';

const ScrollableBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100% - ${BOTTOM_NAVIGATION_HEIGHT_SMALL}); // Padding accounts for safe area inset
  overflow-y: auto;
  padding-block: 1rem calc(env(safe-area-inset-bottom, 0) + 4rem);
  padding-inline: 1rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-block: 1rem;
    padding-inline: 2.5rem;
  }
`;

/**
 * This is the component that renders survey questions.
 */
export const SurveyScreen = () => {
  const { displayQuestions, isResponseScreen } = useSurveyForm();
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile && !isResponseScreen && <MobileSurveyHeader />}
      <ScrollableBody>
        <SurveyQuestionGroup questions={displayQuestions} />
      </ScrollableBody>
      {isMobile ? <MobileSurveyMenu /> : <SurveyPaginator />}
    </>
  );
};
