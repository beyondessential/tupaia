/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useEditUser } from '../../api/mutations';
import { Button } from '../../components';
import { useCurrentUserContext, useProjectSurveys } from '../../api';
import { CountrySelector, useUserCountries } from '../../features';
import { Survey } from '../../types';
import { useIsMobile } from '../../utils';
import { DesktopTemplate } from './DesktopTemplate';
import { MobileTemplate } from './MobileTemplate';

const useNavigateToSurvey = () => {
  const navigate = useNavigate();
  const user = useCurrentUserContext();
  const { mutate: updateUser } = useEditUser();

  return (country, surveyCode) => {
    if (country?.code === user.country?.code) {
      return navigate(`/survey/${country?.code}/${surveyCode}`);
    }

    // update user with new country. If the user goes 'back' and doesn't select a survey, and does not yet have a country selected, that's okay because it will be set whenever they next select a survey
    updateUser(
      { countryId: country?.id },
      {
        onSuccess: () => {
          navigate(`/survey/${country?.code}/${surveyCode}`);
        },
      },
    );
  };
};

export const SurveySelectPage = () => {
  const [selectedSurvey, setSelectedSurvey] = useState<Survey['code'] | null>(null);
  const [urlSearchParams] = useSearchParams();
  const urlProjectId = urlSearchParams.get('projectId');
  const {
    countries,
    selectedCountry,
    updateSelectedCountry,
    isLoading: isLoadingCountries,
  } = useUserCountries();
  const handleSelectSurvey = useNavigateToSurvey();
  const { mutate: updateUser, isLoading: isUpdatingUser } = useEditUser();
  const user = useCurrentUserContext();

  const { isLoading, data: surveys } = useProjectSurveys(user.projectId, selectedCountry?.code);

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

  if (useIsMobile()) {
    return (
      <MobileTemplate
        selectedCountry={selectedCountry}
        selectedSurvey={selectedSurvey}
        setSelectedSurvey={setSelectedSurvey}
        handleSelectSurvey={handleSelectSurvey}
        showLoader={showLoader}
        CountrySelector={
          <CountrySelector
            countries={countries}
            selectedCountry={selectedCountry}
            onChangeCountry={updateSelectedCountry}
          />
        }
      />
    );
  }
  return (
    <DesktopTemplate
      selectedCountry={selectedCountry}
      selectedSurvey={selectedSurvey}
      setSelectedSurvey={setSelectedSurvey}
      showLoader={showLoader}
      CountrySelector={
        <CountrySelector
          countries={countries}
          selectedCountry={selectedCountry}
          onChangeCountry={updateSelectedCountry}
        />
      }
      SubmitButton={
        <Button
          onClick={() => handleSelectSurvey(selectedCountry, selectedSurvey)}
          disabled={!selectedSurvey || isUpdatingUser}
          tooltip={selectedSurvey ? '' : 'Select survey to proceed'}
        >
          Next
        </Button>
      }
    />
  );
};
