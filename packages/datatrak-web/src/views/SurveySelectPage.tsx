import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { DialogActions, Paper, Typography } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { useEditUser } from '../api/mutations';
import { Button } from '../components';
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
  const [urlSearchParams] = useSearchParams();
  const urlProjectId = urlSearchParams.get('projectId');
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
  const { mutateAsync: updateUser, isLoading: isUpdatingUser } = useEditUser();
  const user = useCurrentUserContext();

  const { isLoading, data: surveys } = useProjectSurveys(user.projectId, selectedCountry?.code);

  const handleSelectSurvey = () => {
    if (countryHasUpdated) {
      // update user with new country. If the user goes 'back' and doesn't select a survey, and does not yet have a country selected, that's okay because it will be set whenever they next select a survey
      updateUser(
        { countryId: selectedCountry?.id },
        {
          onSuccess: navigateToSurvey,
        },
      );
    } else navigateToSurvey();
  };

  useEffect(() => {
    // when the surveys change, check if the selected survey is still in the list. If not, clear the selection
    if (selectedSurvey && !surveys?.find(survey => survey.code === selectedSurvey)) {
      setSelectedSurvey(null);
    }
  }, [JSON.stringify(surveys)]);

  useEffect(() => {
    const updateUserProject = async () => {
      if (urlProjectId && user.projectId !== urlProjectId) {
        updateUser({ projectId: urlProjectId });
      }
    };
    updateUserProject();
  }, [urlProjectId]);

  const showLoader =
    isLoading ||
    isLoadingCountries ||
    isUpdatingUser ||
    (urlProjectId && urlProjectId !== user?.projectId); // in this case the user will be updating and all surveys etc will be reloaded, so showing a loader when this is the case means a more seamless experience
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
