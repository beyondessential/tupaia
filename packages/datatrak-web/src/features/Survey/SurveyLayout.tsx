/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Outlet, generatePath, useNavigate, useParams } from 'react-router';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Paper as MuiPaper } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { SurveyParams } from '../../types';
import { useSurveyForm } from './SurveyContext';
import { SIDE_MENU_WIDTH, SurveySideMenu, SurveyToolbar, SurveyPaginator } from './Components';
import { HEADER_HEIGHT, ROUTES, SURVEY_TOOLBAR_HEIGHT } from '../../constants';
import { useSubmitSurvey } from '../../api/mutations';
import { getErrorsByScreen } from './utils';

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

const SurveyScreenContainer = styled.div<{
  $scrollable?: boolean;
}>`
  display: flex;
  overflow: ${({ $scrollable }) => ($scrollable ? 'auto' : 'hidden')};
  align-items: flex-start;
  height: calc(100vh - ${HEADER_HEIGHT} - ${SURVEY_TOOLBAR_HEIGHT});
  width: 100vw;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: -1.25rem;
    padding-top: ${({ $scrollable }) => ($scrollable ? '0' : '2rem')};
    padding-bottom: 2rem;
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
  const params = useParams<SurveyParams>();
  const {
    setFormData,
    formData,
    isLast,
    screenNumber,
    sideMenuOpen,
    numberOfScreens,
    isSuccessScreen,
    isReviewScreen,
    visibleScreens,
  } = useSurveyForm();
  const { handleSubmit, getValues } = useFormContext();
  const { mutate: submitSurvey, isLoading: isSubmittingSurvey } = useSubmitSurvey();

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
          errors: stringifiedErrors,
        },
      },
    );
  };

  const handleStep = (path, data) => {
    setFormData({ ...formData, ...data });
    navigate(path);
  };

  const navigateNext = data => {
    const path = isLast
      ? generatePath(ROUTES.SURVEY_REVIEW, params)
      : generatePath(ROUTES.SURVEY_SCREEN, {
          ...params,
          screenNumber: String(screenNumber! + 1),
        });
    handleStep(path, data);
  };

  const onStepPrevious = () => {
    const data = getValues();
    let path = ROUTES.SURVEY_SELECT;
    const prevScreenNumber = isReviewScreen ? numberOfScreens : screenNumber! - 1;
    if (prevScreenNumber) {
      path = generatePath(ROUTES.SURVEY_SCREEN, {
        ...params,
        screenNumber: String(prevScreenNumber),
      });
    }

    handleStep(path, data);
  };

  const onSubmit = data => {
    if (isReviewScreen) return submitSurvey(data);
    return navigateNext(data);
  };

  const handleClickSubmit = handleSubmit(onSubmit, onError);

  return (
    <>
      <SurveyToolbar />
      <SurveyScreenContainer $scrollable={isSuccessScreen}>
        <SurveySideMenu />
        <ScrollableLayout $sideMenuClosed={!sideMenuOpen && !isReviewScreen}>
          <Paper>
            <Form onSubmit={handleClickSubmit} noValidate>
              <Outlet />
              {isSubmittingSurvey && (
                <LoadingContainer>
                  <SpinningLoader />
                </LoadingContainer>
              )}
              <SurveyPaginator onStepPrevious={onStepPrevious} isLoading={isSubmittingSurvey} />
            </Form>
          </Paper>
        </ScrollableLayout>
      </SurveyScreenContainer>
    </>
  );
};
