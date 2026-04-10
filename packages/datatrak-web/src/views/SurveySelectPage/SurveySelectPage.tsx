import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Country, KeysToCamelCase } from '@tupaia/types';
import { useCurrentUserContext } from '../../api';
import { useEditUser } from '../../api/mutations';
import { useSurveysQuery } from '../../api/queries/useSurveysQuery';
import { Button } from '../../components';
import { CountrySelector } from '../../features';
import { useUserCountries } from '../../features/CountrySelector/useUserCountries';
import { Survey } from '../../types';
import { useIsMobile } from '../../utils';
import { DesktopTemplate } from './DesktopTemplate';
import { DraftExistsModal } from '../../features/Survey/hooks/DraftExistsModal';
import { MobileTemplate } from './MobileTemplate';
import { useSurveySelectionWithDrafts } from './useSurveySelectionWithDrafts';
import { useSyncProjectFromUrl } from './useSyncProjectFromUrl';

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
  const isMobile = useIsMobile();
  const user = useCurrentUserContext();
  const {
    queryResult: { data: countries, isFetching: isFetchingCountries },
    state: [selectedCountry, updateSelectedCountry],
  } = useUserCountries();
  const navigateToSurvey = useNavigateToSurvey();
  const { isUpdatingUser, isSyncingProject } = useSyncProjectFromUrl();
  const { draftModalProps, handleSelectSurvey, isDraftsLoading } = useSurveySelectionWithDrafts(
    setSelectedSurvey,
    navigateToSurvey,
  );

  const { isFetching: isFetchingSurveys, data: surveys } = useSurveysQuery({
    countryCode: selectedCountry?.code,
    projectId: user.projectId,
  });

  // When surveys change, check if the selected survey is still in the list. If not, clear the selection
  if (selectedSurvey && !surveys?.some(survey => survey.code === selectedSurvey)) {
    setSelectedSurvey(null);
  }

  const showLoader = isFetchingSurveys || isFetchingCountries || isUpdatingUser || isSyncingProject || isDraftsLoading;

  const sharedProps = {
    selectedCountry,
    selectedSurvey,
    setSelectedSurvey,
    showLoader,
  };

  const countrySelector = (
    <CountrySelector
      countries={countries}
      key={user.projectId}
      onChange={e => updateSelectedCountry(e.target.value)}
      selectedCountry={selectedCountry}
    />
  );

  return (
    <>
      {isMobile ? (
        <MobileTemplate
          {...sharedProps}
          countrySelector={countrySelector}
          handleSelectSurvey={handleSelectSurvey}
        />
      ) : (
        <DesktopTemplate
          {...sharedProps}
          countrySelector={countrySelector}
          submitButton={
            <Button
              onClick={() => handleSelectSurvey(selectedCountry, selectedSurvey)}
              disabled={!selectedSurvey || isUpdatingUser || isDraftsLoading}
              tooltip={selectedSurvey ? '' : 'Select survey to proceed'}
            >
              Next
            </Button>
          }
        />
      )}
      <DraftExistsModal {...draftModalProps} />
    </>
  );
};
