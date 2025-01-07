/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { SpinningLoader } from '@tupaia/ui-components';
import { useGroupedSurveyList, MobileSelectList } from '../../features';
import { StickyMobileHeader } from '../../layout';
import { ROUTES } from '../../constants';

const MobileContainer = styled.div`
  max-height: 100%;
  background: ${({ theme }) => theme.palette.background.default};
  width: 100%;
  height: 100%;

  // parent selector - targets the parents of this container
  div:has(&) {
    padding: 0;
    height: 100vh;
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
