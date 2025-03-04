import React, { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { PageContainer } from '../../components';
import { ROUTES } from '../../constants';
import { MobileSelectList, useGroupedSurveyList } from '../../features';
import {
  CountrySelector,
  CountrySelectorProps,
} from '../../features/CountrySelector/CountrySelector';
import { ListItemType, UseGroupedSurveyListParams } from '../../features/useGroupedSurveyList';
import { StickyMobileHeader } from '../../layout';
import { NavigateToSurveyType } from './SurveySelectPage';

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

interface MobileSurveySelectPageProps extends UseGroupedSurveyListParams {
  countrySelector: ReactElement<CountrySelectorProps, typeof CountrySelector>;
  showLoader: boolean;
  handleSelectSurvey: NavigateToSurveyType;
}

export const MobileTemplate = ({
  countrySelector,
  selectedCountry,
  setSelectedSurvey,
  showLoader,
  selectedSurvey,
  handleSelectSurvey,
}: MobileSurveySelectPageProps) => {
  const { groupedSurveys } = useGroupedSurveyList({
    selectedCountry,
    setSelectedSurvey,
    selectedSurvey,
  });
  const navigate = useNavigate();

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
      <MobileSelectList
        countrySelector={countrySelector}
        items={groupedSurveys}
        onSelect={onNavigateToSurvey}
        showLoader={showLoader}
      />
    </MobileContainer>
  );
};
