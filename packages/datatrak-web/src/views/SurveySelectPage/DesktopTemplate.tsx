import { DialogActions, Paper, Typography } from '@material-ui/core';
import React, { ComponentPropsWithoutRef, ReactElement } from 'react';
import styled from 'styled-components';

import { SpinningLoader } from '@tupaia/ui-components';

import { Button } from '../../components';
import { CountrySelector, GroupedSurveyList } from '../../features';
import { CountrySelectorProps } from '../../features/CountrySelector/CountrySelector';
import { UseGroupedSurveyListParams } from '../../features/useGroupedSurveyList';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  inline-size: 48rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &.MuiPaper-root {
    max-height: 100%;
    height: 35rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  block-size: 100%;
  min-block-size: 20rem;
  flex: 1;
`;

const Loader = () => (
  <LoadingContainer>
    <SpinningLoader />
  </LoadingContainer>
);

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  margin-block-end: 1rem;
`;

const Subheader = styled(Typography).attrs({
  variant: 'h2',
})`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  line-height: 1.125;
  font-weight: 400;
  margin-block-start: 0.67rem;
`;

interface DesktopSurveySelectPageProps extends UseGroupedSurveyListParams {
  countrySelector: ReactElement<CountrySelectorProps, typeof CountrySelector>;
  showLoader: boolean;
  submitButton: ReactElement<ComponentPropsWithoutRef<typeof Button>, typeof Button>;
}

export const DesktopTemplate = ({
  selectedCountry,
  countrySelector,
  selectedSurvey,
  setSelectedSurvey,
  showLoader,
  submitButton,
}: DesktopSurveySelectPageProps) => {
  return (
    <Container>
      <HeaderWrapper>
        <div>
          <Typography variant="h1">Select survey</Typography>
          <Subheader>Select a survey from the list below</Subheader>
        </div>
        {countrySelector}
      </HeaderWrapper>
      {showLoader ? (
        <Loader />
      ) : (
        <GroupedSurveyList
          selectedCountry={selectedCountry}
          setSelectedSurvey={setSelectedSurvey}
          selectedSurvey={selectedSurvey}
        />
      )}
      <DialogActions>
        <Button to="/" variant="outlined">
          Cancel
        </Button>
        {submitButton}
      </DialogActions>
    </Container>
  );
};
