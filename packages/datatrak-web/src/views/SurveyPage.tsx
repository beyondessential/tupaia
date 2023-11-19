/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useForm, FormProvider } from 'react-hook-form';
import { FullPageLoader } from '@tupaia/ui-components';
import { useCountry, useCurrentUser, useEditUser, useSurvey } from '../api';
import { CancelConfirmModal } from '../components';
import { SurveyToolbar, useSurveyForm, useValidationResolver, SurveyContext } from '../features';
import { SurveyParams } from '../types';
import { HEADER_HEIGHT, SURVEY_TOOLBAR_HEIGHT } from '../constants';
import { successToast } from '../utils';
// wrap the entire page so that other content can be centered etc
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  .MuiBox-root {
    height: 100%; // this is to fix the loader causing a scrollbar
  }
  ${({ theme }) => theme.breakpoints.down('sm')} {
    .MuiContainer-root:has(&) {
      padding: 0;
    }
  }
`;

const SurveyScreenContainer = styled.div<{
  $scrollable?: boolean;
  $hasToolbar?: boolean;
}>`
  display: flex;
  overflow: ${({ $scrollable }) => ($scrollable ? 'auto' : 'hidden')};
  align-items: flex-start;
  height: ${({ $hasToolbar }) =>
    $hasToolbar
      ? `calc(100vh - ${HEADER_HEIGHT} - ${SURVEY_TOOLBAR_HEIGHT})`
      : `calc(100vh - ${HEADER_HEIGHT})`};
  width: 100%;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: -1.25rem;
    padding-top: ${({ $scrollable }) => ($scrollable ? '0' : '2rem')};
    padding-bottom: 2rem;
  }
`;

const SurveyPageInner = () => {
  const { surveyCode, screenNumber } = useParams<SurveyParams>();
  const { isLoading } = useSurvey(surveyCode);
  const {
    formData,
    isSuccessScreen,
    isResponseScreen,
    cancelModalOpen,
    closeCancelConfirmation,
  } = useSurveyForm();
  const resolver = useValidationResolver();
  const formContext = useForm({ defaultValues: formData, reValidateMode: 'onSubmit', resolver });

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <PageWrapper>
      <FormProvider {...formContext}>
        <SurveyToolbar />
        <SurveyScreenContainer $scrollable={isSuccessScreen} $hasToolbar={!isResponseScreen}>
          {/* Use a key to render a different survey screen component for every screen number. This is so
      that the screen can be easily initialised with the form data. See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes */}
          <Outlet key={screenNumber} />
        </SurveyScreenContainer>
      </FormProvider>
      <CancelConfirmModal isOpen={cancelModalOpen} onClose={closeCancelConfirmation} />
    </PageWrapper>
  );
};

// The form provider has to be outside the outlet so that the form context is available to all. This is also so that the side menu can be outside of the 'SurveyLayout' page, because otherwise it rerenders on survey screen change, which makes it close and open again every time you change screen via the jump-to menu. The survey side menu needs to be inside the form provider so that it can access the form context to save form data
export const SurveyPage = () => {
  const { countryCode } = useParams<SurveyParams>();
  const { mutateAsync: editUser } = useEditUser();
  const user = useCurrentUser();
  const { data: surveyCountry } = useCountry(user.project?.code, countryCode);

  // Update the user's preferred country if they start a survey in a different country
  // Todo: add check for project code once project_ids are added to the survey table
  useEffect(() => {
    if (!surveyCountry?.code) {
      return;
    }
    if (user.country?.code !== countryCode) {
      editUser(
        {
          countryId: surveyCountry?.id,
        },
        { onSuccess: () => successToast(`Preferred country updated to ${surveyCountry?.name}`) },
      );
    }
  }, [surveyCountry?.code]);

  return (
    <SurveyContext>
      <SurveyPageInner />
    </SurveyContext>
  );
};
