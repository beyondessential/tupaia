/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { DialogActions, Paper, Typography } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { useEditUser } from '../api/mutations';
import { ListItemType, Button } from '../components';
import { useCurrentUserContext, useProjectSurveys } from '../api';
import { HEADER_HEIGHT } from '../constants';
import { CountrySelector, GroupedSurveyList, useUserCountries } from '../features';
import { Survey } from '../types';

const Container = styled(Paper).attrs({
  variant: 'outlined',
})`
  width: 48rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &.MuiPaper-root {
    max-height: 100%;
    height: 35rem;
  }
  ${({ theme }) => theme.breakpoints.down('sm')} {
    width: 100%;
    border-radius: 0;
    border-left: none;
    border-right: none;
    &.MuiPaper-root {
      height: 100%;
    }
    // parent selector - targets the parent of this container
    div:has(&) {
      padding: 0;
      align-items: flex-start;
      height: calc(100vh - ${HEADER_HEIGHT});
    }
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

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 1rem;
  > div {
    width: 100%;
  }
  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    > div {
      width: auto;
    }
  }
`;

const Subheader = styled(Typography).attrs({
  variant: 'h2',
})`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  line-height: 1.125;
  font-weight: 400;
  margin-top: 0.67rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-bottom: 0.5rem;
  }
`;

export const SurveySelectPage = () => {
  const navigate = useNavigate();
  const [selectedSurvey, setSelectedSurvey] = useState<Survey['code'] | null>(null);
  const {
    countries,
    selectedCountry,
    updateSelectedCountry,
    countryHasUpdated,
    isLoading: isLoadingCountries,
  } = useUserCountries();
  const navigateToSurvey = () => {
    navigate(`/survey/${selectedCountry?.code}/${selectedSurvey}`);
  };
  const { mutate: updateUser, isLoading: isUpdatingUser } = useEditUser(navigateToSurvey);
  const user = useCurrentUserContext();

  const { isLoading } = useProjectSurveys(user.projectId, selectedCountry?.name);

  const handleSelectSurvey = () => {
    if (countryHasUpdated) {
      // update user with new country. If the user goes 'back' and doesn't select a survey, and does not yet have a country selected, that's okay because it will be set whenever they next select a survey
      updateUser({ countryId: selectedCountry?.id });
    } else navigateToSurvey();
  };

  const showLoader = isLoading || isLoadingCountries || isUpdatingUser;
  return (
    <Container>
      <HeaderWrapper>
        <div>
          <Typography variant="h1">Select survey</Typography>
          <Subheader>Select a survey from the list below</Subheader>
        </div>
        <CountrySelector
          countries={countries}
          selectedCountry={selectedCountry}
          onChangeCountry={updateSelectedCountry}
        />
      </HeaderWrapper>
      {showLoader ? (
        <LoadingContainer>
          <SpinningLoader />
        </LoadingContainer>
      ) : (
        <GroupedSurveyList
          setSelectedSurvey={setSelectedSurvey}
          selectedSurvey={selectedSurvey}
          selectedCountry={selectedCountry}
        />
      )}
      <DialogActions>
        <Button to="/" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSelectSurvey}
          disabled={!selectedSurvey || isUpdatingUser}
          tooltip={selectedSurvey ? '' : 'Select survey to proceed'}
        >
          Next
        </Button>
      </DialogActions>
    </Container>
  );
};