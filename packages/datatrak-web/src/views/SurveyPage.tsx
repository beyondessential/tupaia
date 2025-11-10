import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Outlet, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useCurrentUserContext, useEditUser, useEntityByCode, useSurvey } from '../api';
import { HEADER_HEIGHT, TITLE_BAR_HEIGHT } from '../constants';
import {
  DesktopSurveyHeader,
  SurveyContext,
  useSurveyForm,
  useValidationResolver,
} from '../features';
import { CancelSurveyConfirmationToken } from '../features/Survey/Components';
import { SurveyParams } from '../types';
import { successToast, useIsMobile } from '../utils';

// wrap the entire page so that other content can be centered etc
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  block-size: 100%;
  .MuiBox-root {
    block-size: 100%; // this is to fix the loader causing a scrollbar
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

  block-size: 100dvb;
  inline-size: 100%;
  ${({ theme }) => theme.breakpoints.up('md')} {
    block-size: ${({ $hasToolbar }) =>
      $hasToolbar
        ? `calc(100dvb - ${HEADER_HEIGHT} - ${TITLE_BAR_HEIGHT})`
        : `calc(100dvb - ${HEADER_HEIGHT})`};
    margin-inline-start: -1.25rem;
    padding-block-start: ${({ $scrollable }) => ($scrollable ? '0' : '2rem')};
    padding-block-end: 2rem;
  }
`;

const SurveyPageInner = () => {
  const { screenNumber } = useParams<SurveyParams>();
  const { countryCode, formData, isResponseScreen, isResubmit, isSuccessScreen, surveyCode } =
    useSurveyForm();
  const resolver = useValidationResolver();
  const formContext = useForm({ defaultValues: formData, reValidateMode: 'onSubmit', resolver });
  const { mutateAsync: editUser } = useEditUser();
  const user = useCurrentUserContext();
  const { data: survey } = useSurvey(surveyCode);
  const { data: surveyCountry } = useEntityByCode(countryCode);

  // Update the user's preferred country if they start a survey in a different country
  useEffect(() => {
    if (
      !surveyCountry?.code ||
      !user.isLoggedIn ||
      isResubmit ||
      user.country?.code === countryCode // Don’t bother updating if no change
    ) {
      return;
    }

    editUser(
      { countryId: surveyCountry?.id },
      { onSuccess: () => successToast(`Preferred country updated to ${surveyCountry?.name}`) },
    );
  }, [
    countryCode,
    isResubmit,
    surveyCountry?.code,
    surveyCountry?.id,
    user.country?.code,
    user.isLoggedIn,
  ]);

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

  return (
    <PageWrapper>
      <FormProvider {...formContext}>
        {!useIsMobile() ? <DesktopSurveyHeader /> : null}
        <SurveyScreenContainer $scrollable={isSuccessScreen} $hasToolbar={!isResponseScreen}>
          {/* Use a key to render a different survey screen component for every screen number. This is so
      that the screen can be easily initialised with the form data. See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes */}
          <Outlet key={screenNumber} />
        </SurveyScreenContainer>

        <CancelSurveyConfirmationToken />
      </FormProvider>
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
