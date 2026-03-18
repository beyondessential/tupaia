import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import { Country, KeysToCamelCase } from '@tupaia/types';
import { useCurrentUserContext } from '../../api';
import { useEditUser } from '../../api/mutations';
import { useSurveyResponseDrafts } from '../../api/queries/useSurveyResponseDrafts';
import { useSurveysQuery } from '../../api/queries/useSurveysQuery';
import { Button } from '../../components';
import { CountrySelector } from '../../features';
import { useUserCountries } from '../../features/CountrySelector/useUserCountries';
import { Survey } from '../../types';
import { useIsMobile } from '../../utils';
import { DesktopTemplate } from './DesktopTemplate';
import { DraftExistsModal } from './DraftExistsModal';
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
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [urlSearchParams] = useSearchParams();
  const urlProjectId = urlSearchParams.get('projectId');
  const {
    queryResult: { data: countries, isFetching: isFetchingCountries },
    state: [selectedCountry, updateSelectedCountry],
  } = useUserCountries();
  const navigateToSurvey = useNavigateToSurvey();
  const { mutate: updateUser, isLoading: isUpdatingUser } = useEditUser();
  const user = useCurrentUserContext();
  const { data: allDrafts } = useSurveyResponseDrafts();

  const { isFetching: isFetchingSurveys, data: surveys } = useSurveysQuery({
    countryCode: selectedCountry?.code,
    projectId: user.projectId,
  });

  // When surveys change, check if the selected survey is still in the list. If not, clear the selection
  if (selectedSurvey && !surveys?.some(survey => survey.code === selectedSurvey)) {
    setSelectedSurvey(null);
  }

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

  const matchingDrafts = allDrafts.filter(
    draft => draft.surveyCode === selectedSurvey && draft.countryCode === selectedCountry?.code,
  );

  const firstDraft = matchingDrafts[0];
  const resumePath = firstDraft
    ? `/survey/${firstDraft.countryCode}/${firstDraft.surveyCode}/${firstDraft.screenNumber ?? 0}?draftId=${firstDraft.id}`
    : '';

  const handleSelectSurvey: NavigateToSurveyType = (country, surveyCode) => {
    const draftsForSurvey = allDrafts.filter(
      draft => draft.surveyCode === surveyCode && draft.countryCode === country?.code,
    );

    if (draftsForSurvey.length > 0) {
      setSelectedSurvey(surveyCode);
      setShowDraftModal(true);
      return;
    }

    navigateToSurvey(country, surveyCode);
  };

  const countrySelector = (
    <CountrySelector
      countries={countries}
      key={user.projectId} // Force fresh instance when project changes
      onChange={e => updateSelectedCountry(e.target.value)}
      selectedCountry={selectedCountry}
    />
  );

  const draftExistsModal = (
    <DraftExistsModal
      isOpen={showDraftModal}
      onClose={() => setShowDraftModal(false)}
      onStartNew={() => {
        setShowDraftModal(false);
        navigateToSurvey(selectedCountry, selectedSurvey);
      }}
      resumePath={resumePath}
    />
  );

  if (useIsMobile()) {
    return (
      <>
        <MobileTemplate
          countrySelector={countrySelector}
          selectedCountry={selectedCountry}
          selectedSurvey={selectedSurvey}
          setSelectedSurvey={setSelectedSurvey}
          handleSelectSurvey={handleSelectSurvey}
          showLoader={showLoader}
        />
        {draftExistsModal}
      </>
    );
  }
  return (
    <>
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
      {draftExistsModal}
    </>
  );
};
