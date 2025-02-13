import React from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { SpinningLoader } from '@tupaia/ui-components';

import { PageContainer } from '../../components';
import { ROUTES } from '../../constants';
import { MobileSelectList, useGroupedSurveyList } from '../../features';
import { StickyMobileHeader } from '../../layout';

const MobileContainer = styled.div`
  background-color: ${({ theme }) => theme.palette.background.default};
  block-size: 100%;
  inline-size: 100%;
  max-block-size: 100%;

  // parent selector - targets the parents of this container
  div:has(&) {
    padding: 0;
    block-size: 100vb;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 20rem;
  flex: 1;
`;

const Loader = () => (
  <LoadingContainer>
    <SpinningLoader />
  </LoadingContainer>
);

export const MobileTemplate = ({
  selectedCountry,
  setSelectedSurvey,
  showLoader,
  CountrySelector,
  selectedSurvey,
  handleSelectSurvey,
}) => {
  const { groupedSurveys } = useGroupedSurveyList({
    setSelectedSurvey,
    selectedSurvey,
    selectedCountry,
  });
  const navigate = useNavigate();

  if (showLoader) {
    return <Loader />;
  }

  const onClose = () => {
    navigate(ROUTES.HOME);
  };
  const onNavigateToSurvey = survey => {
    handleSelectSurvey(selectedCountry, survey.value);
  };

  return (
    <MobileContainer>
      <StickyMobileHeader onBack={onClose} onClose={onClose}>
        Select a survey
      </StickyMobileHeader>
      <MobileSelectList
        items={groupedSurveys}
        onSelect={onNavigateToSurvey}
        CountrySelector={CountrySelector}
      />
    </MobileContainer>
  );
};
