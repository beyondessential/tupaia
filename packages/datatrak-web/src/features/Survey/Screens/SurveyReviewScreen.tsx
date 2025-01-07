/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { useOutletContext } from 'react-router-dom';
import {
  MobileSurveyMenu,
  SurveyPaginator,
  SurveyReviewSection,
  SurveySideMenu,
} from '../Components';
import { ScrollableBody, StickyMobileHeader } from '../../../layout';
import { useIsMobile } from '../../../utils';
import { useSurveyForm } from '../SurveyContext';

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

const StickyHeader = styled(StickyMobileHeader)`
  h2 {
    text-align: center;
  }
`;

type SurveyLayoutContext = {
  isLoading: boolean;
  onStepPrevious: () => void;
  hasBackButton: boolean;
};

const MobileHeader = () => {
  const { openCancelConfirmation } = useSurveyForm();
  const { onStepPrevious } = useOutletContext<SurveyLayoutContext>();

  const handleBack = () => {
    onStepPrevious();
  };
  return (
    <StickyHeader title="Review & submit" onBack={handleBack} onClose={openCancelConfirmation} />
  );
};

export const SurveyReviewScreen = () => {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile && <MobileHeader />}
      {!isMobile && (
        <Header>
          <PageHeading>Review and submit</PageHeading>
          <PageDescription>
            Please review your survey answers below. To edit any answers, please navigate back using
            the ‘Back’ button below. Once submitted, your survey answers will be uploaded to Tupaia.
          </PageDescription>
        </Header>
      )}
      <ScrollableBody>
        <SurveyReviewSection />
      </ScrollableBody>

      {isMobile ? <MobileSurveyMenu /> : <SurveyPaginator />}
    </>
  );
};
