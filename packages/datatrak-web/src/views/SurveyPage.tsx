import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Outlet, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useCurrentUserContext, useEditUser, useEntityByCode, useSurvey } from '../api';
import { CancelConfirmModal } from '../components';
import { HEADER_HEIGHT, TITLE_BAR_HEIGHT } from '../constants';
import {
  DesktopSurveyHeader,
  SurveyContext,
  useSurveyForm,
  useValidationResolver,
} from '../features';
import { SurveyParams } from '../types';
import { successToast, useBeforeUnload, useIsMobile } from '../utils';

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

  height: 100vh;
  width: 100%;
  ${({ theme }) => theme.breakpoints.up('md')} {
    height: ${({ $hasToolbar }) =>
      $hasToolbar
        ? `calc(100vh - ${HEADER_HEIGHT} - ${TITLE_BAR_HEIGHT})`
        : `calc(100vh - ${HEADER_HEIGHT})`};
    margin-left: -1.25rem;
    padding-top: ${({ $scrollable }) => ($scrollable ? '0' : '2rem')};
    padding-bottom: 2rem;
  }
`;

const SurveyPageInner = () => {
  const { screenNumber } = useParams<SurveyParams>();
  const {
    formData,
    isSuccessScreen,
    isResponseScreen,
    cancelModalOpen,
    cancelModalConfirmLink,
    closeCancelConfirmation,
    isResubmit,
    countryCode,
    surveyCode,
  } = useSurveyForm();
  const resolver = useValidationResolver();
  const formContext = useForm({ defaultValues: formData, reValidateMode: 'onSubmit', resolver });
  const { mutateAsync: editUser } = useEditUser();
  const user = useCurrentUserContext();
  const { data: survey } = useSurvey(surveyCode);
  const { data: surveyCountry } = useEntityByCode(countryCode!);

  // Update the user's preferred country if they start a survey in a different country
  useEffect(() => {
    if (!surveyCountry?.code || !user.isLoggedIn || isResubmit) {
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

  // Update the user's preferred project if they start a survey in a different project to the saved project
  useEffect(() => {
    if (!survey?.projectId || !user.isLoggedIn || isResubmit) {
      return;
    }
    const { projectId } = survey;
    if (user?.projectId !== projectId) {
      editUser(
        {
          projectId,
        },
        { onSuccess: () => successToast(`Preferred project updated to ${survey.project?.name}`) },
      );
    }
  }, [survey?.id]);

  useBeforeUnload(formContext.formState.isDirty && !isSuccessScreen);

  return (
    <PageWrapper>
      <FormProvider {...formContext}>
        {!useIsMobile() ? <DesktopSurveyHeader /> : null}
        <SurveyScreenContainer $scrollable={isSuccessScreen} $hasToolbar={!isResponseScreen}>
          {/* Use a key to render a different survey screen component for every screen number. This is so
      that the screen can be easily initialised with the form data. See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes */}
          <Outlet key={screenNumber} />
        </SurveyScreenContainer>
      </FormProvider>
      <CancelConfirmModal
        isOpen={cancelModalOpen}
        onClose={closeCancelConfirmation}
        confirmPath={cancelModalConfirmLink}
      />
    </PageWrapper>
  );
};

/**
 * @privateRemarks The form provider has to be outside the outlet so that the form context is
 * available to all. This is also so that the side menu can be outside of the 'SurveyLayout' page,
 * because otherwise it rerenders on survey screen change, which makes it close and open again every
 * time you change screen via the jump-to menu. The survey side menu needs to be inside the form
 * provider so that it can access the form context to save form data
 */
export const SurveyPage = () => {
  const { countryCode, surveyCode } = useParams<SurveyParams>();
  return (
    <SurveyContext surveyCode={surveyCode} countryCode={countryCode}>
      <SurveyPageInner />
    </SurveyContext>
  );
};
