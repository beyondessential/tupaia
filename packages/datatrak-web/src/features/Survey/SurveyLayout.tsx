/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { Outlet, generatePath, useNavigate, useParams } from 'react-router';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Paper as MuiPaper } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { ROUTES } from '../../constants';
import { useResubmitSurveyResponse, useSubmitSurveyResponse } from '../../api/mutations';
import { SurveyParams } from '../../types';
import { useFromLocation } from '../../utils';
import { useSurveyForm } from './SurveyContext';
import { SIDE_MENU_WIDTH, SurveySideMenu } from './Components';
import { getErrorsByScreen } from './utils';
import { useSurveyRouting } from './useSurveyRouting';

const ScrollableLayout = styled.div<{
  $sideMenuClosed?: boolean;
}>`
  overflow-y: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 0 1rem;
    margin-left: ${({ $sideMenuClosed }) => ($sideMenuClosed ? `-${SIDE_MENU_WIDTH}` : 0)};
    transition: margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms;
  }
`;

const Paper = styled(MuiPaper).attrs({
  variant: 'outlined',
  elevation: 0,
})`
  flex: 1;
  max-width: 63rem;
  padding: 0;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: 1rem;
    border-radius: 4px;
  }
`;

const Form = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);
`;
/**
 * This layout is used for the survey screens as well as the review screen.
 */
export const SurveyLayout = () => {
  const navigate = useNavigate();
  const from = useFromLocation();
  const params = useParams<SurveyParams>();
  const isFetchingEntities = useIsFetching({ queryKey: ['entityAncestors'] });

  const {
    updateFormData,
    formData,
    isLast,
    screenNumber,
    sideMenuOpen,
    numberOfScreens,
    isReviewScreen,
    isResponseScreen,
    visibleScreens,
    isResubmitReviewScreen,
  } = useSurveyForm();

  const { handleSubmit, getValues } = useFormContext();
  const { mutate: submitSurveyResponse, isLoading: isSubmittingSurveyResponse } =
    useSubmitSurveyResponse(from);
  const { mutate: resubmitSurveyResponse, isLoading: isResubmittingSurveyResponse } =
    useResubmitSurveyResponse();
  const { back, next } = useSurveyRouting(numberOfScreens);

  const handleStep = (path, data) => {
    updateFormData({ ...formData, ...data });
    navigate(path, {
      state: {
        ...(from && { from }),
      },
    });
  };

  const onStepPrevious = () => {
    const data = getValues();
    handleStep(back, data);
  };

  const navigateNext = data => {
    handleStep(next, data);
  };

  const onError = errors => {
    // If we're not on the last screen, we don't need to do anything, because the errors get focussed and handled by react-hook-form
    if (!isLast) return;
    // Group the errors by screen number, so that we can easily navigate to the first screen with errors
    const errorsByScreen = getErrorsByScreen(errors, visibleScreens);
    // // if any errors on this page, return and let react-hook-form handle them, instead of snapping to the first screen with errors, which would be confusing
    if (errorsByScreen[screenNumber!]) return;

    // Find the first screen with errors
    const [surveyScreenToSnapTo, screenErrors] = Object.entries(errorsByScreen)[0];
    if (!surveyScreenToSnapTo) return;
    // we have to serialize the errors for the location state as per https://github.com/remix-run/react-router/issues/8792. We can't just set the errors manually in the form because when we navigate to the screen, the form errors will reset
    const stringifiedErrors = JSON.stringify(screenErrors);

    navigate(
      generatePath(ROUTES.SURVEY_SCREEN, {
        ...params,
        screenNumber: surveyScreenToSnapTo,
      }),
      {
        state: {
          ...(from && { from }),
          errors: stringifiedErrors,
        },
      },
    );
  };

  const onSubmit = data => {
    const submitAction = isResubmitReviewScreen ? resubmitSurveyResponse : submitSurveyResponse;
    if (isReviewScreen || isResubmitReviewScreen) return submitAction({ ...formData, ...data });
    return navigateNext(data);
  };

  const handleClickSubmit = handleSubmit(onSubmit, onError);

  const showLoader =
    isSubmittingSurveyResponse || isResubmittingSurveyResponse || !!isFetchingEntities;

  return (
    <>
      <SurveySideMenu />
      <ScrollableLayout $sideMenuClosed={!sideMenuOpen && !isReviewScreen && !isResponseScreen}>
        <Paper>
          <Form onSubmit={handleClickSubmit} noValidate>
            <Outlet context={{ onStepPrevious, isLoading: showLoader, hasBackButton: !!back }} />
            {showLoader && (
              <LoadingContainer>
                <SpinningLoader />
              </LoadingContainer>
            )}
          </Form>
        </Paper>
      </ScrollableLayout>
    </>
  );
};
