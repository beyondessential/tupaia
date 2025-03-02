import React from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { SpinningLoader } from '@tupaia/ui-components';

import { PageContainer } from '../../components';
import { ROUTES } from '../../constants';
import { MobileSelectList, useGroupedSurveyList, useUserCountries } from '../../features';
import { ListItemType } from '../../features/useGroupedSurveyList';
import { StickyMobileHeader } from '../../layout';

const MobileContainer = styled.div`
  background-color: ${({ theme }) => theme.palette.background.default};
  block-size: 100%;
  inline-size: 100%;
  max-block-size: 100%;

  div:has(> &),
  ${PageContainer}:has(&) {
    padding: 0;

    block-size: 100dvb;
    @supports not (block-size: 100dvb) {
      block-size: 100vb;
    }
  }
`;

const LoadingContainer = styled.div`
  align-items: center;
  block-size: 100%;
  display: flex;
  flex: 1;
  justify-content: center;
  min-block-size: 20rem;
`;

const Loader = () => (
  <LoadingContainer>
    <SpinningLoader />
  </LoadingContainer>
);

export const MobileTemplate = ({
  setSelectedSurvey,
  showLoader,
  selectedSurvey,
  handleSelectSurvey,
}) => {
  const { selectedCountry } = useUserCountries();
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
  const onNavigateToSurvey = (survey: ListItemType) => {
    handleSelectSurvey(selectedCountry, survey.value);
  };

  return (
    <MobileContainer>
      <StickyMobileHeader onBack={onClose} onClose={onClose}>
        Select a survey
      </StickyMobileHeader>
      <MobileSelectList items={groupedSurveys} onSelect={onNavigateToSurvey} />
    </MobileContainer>
  );
};
