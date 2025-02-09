import { Typography } from '@material-ui/core';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { StickyMobileHeader } from '../../../layout';
import { useIsMobile } from '../../../utils';
import { MobileSurveyMenu, SurveyPaginator, SurveyReviewSection } from '../Components';
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

interface SurveyLayoutContext {
  isLoading: boolean;
  onStepPrevious: () => void;
  hasBackButton: boolean;
}

const MobileHeader = () => {
  const { openCancelConfirmation } = useSurveyForm();
  const { onStepPrevious } = useOutletContext<SurveyLayoutContext>();

  const handleBack = () => {
    onStepPrevious();
  };

  return (
    <StickyHeader onBack={handleBack} onClose={openCancelConfirmation}>
      Review & submit
    </StickyHeader>
  );
};

const ScrollableBody = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1rem 4rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 1rem 2rem 4rem;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1rem 2.5rem;
  }
`;

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
