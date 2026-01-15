import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import { Country, KeysToCamelCase } from '@tupaia/types';

import { useCurrentUserContext } from '../../api';
import { useEditUser } from '../../api/mutations';
import { useSurveysQuery } from '../../api/queries/useSurveysQuery';
import { Button } from '../../components';
import { CountrySelector, useUserCountries } from '../../features';
import { Survey } from '../../types';
import { useIsMobile } from '../../utils';
import { DesktopTemplate } from './DesktopTemplate';
import { MobileTemplate } from './MobileTemplate';

const useNavigateToSurvey = () => {
  const navigate = useNavigate();
  const user = useCurrentUserContext();
  const { mutate: updateUser } = useEditUser();

  return (
    country: KeysToCamelCase<Country> | null | undefined,
    surveyCode: Survey['code'] | null,
  ) => {
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

export type NavigateToSurveyType = ReturnType<typeof useNavigateToSurvey>;

export const SurveySelectPage = () => {
  const [selectedSurvey, setSelectedSurvey] = useState<Survey['code'] | null>(null);
  const [urlSearchParams] = useSearchParams();
  const urlProjectId = urlSearchParams.get('projectId');
  const {
    countries,
    selectedCountry,
    updateSelectedCountry,
    isFetching: isFetchingCountries,
  } = useUserCountries();
  const handleSelectSurvey = useNavigateToSurvey();
  const { mutate: updateUser, isLoading: isUpdatingUser } = useEditUser();
  const user = useCurrentUserContext();

  const { isFetching: isFetchingSurveys, data: surveys } = useSurveysQuery({
    countryCode: selectedCountry?.code,
    projectId: user.projectId,
  });

  useEffect(() => {
    // when the surveys change, check if the selected survey is still in the list. If not, clear the selection
    if (selectedSurvey && !surveys?.find(survey => survey.code === selectedSurvey)) {
      setSelectedSurvey(null);
    }
  }, [surveys]);

  useEffect(() => {
    const updateUserProject = async () => {
      if (urlProjectId && user.projectId !== urlProjectId) {
        updateUser({ projectId: urlProjectId });
      }
    };
    updateUserProject();
  }, [urlProjectId]);

  const showLoader =
    isFetchingSurveys ||
    isFetchingCountries ||
    isUpdatingUser ||
    (urlProjectId !== null && urlProjectId !== user?.projectId); // in this case the user will be updating and all surveys etc will be reloaded, so showing a loader when this is the case means a more seamless experience

  const countrySelector = (
    <CountrySelector
      countries={countries}
      onChange={updateSelectedCountry}
      key={user.projectId} // Force fresh instance when project changes
      selectedCountry={selectedCountry}
    />
  );

  if (useIsMobile()) {
    return (
      <MobileTemplate
        countrySelector={countrySelector}
        selectedCountry={selectedCountry}
        selectedSurvey={selectedSurvey}
        setSelectedSurvey={setSelectedSurvey}
        handleSelectSurvey={handleSelectSurvey}
        showLoader={showLoader}
      />
    );
  }
  return (
    <DesktopTemplate
      selectedCountry={selectedCountry}
      countrySelector={countrySelector}
      selectedSurvey={selectedSurvey}
      setSelectedSurvey={setSelectedSurvey}
      showLoader={showLoader}
      submitButton={
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
