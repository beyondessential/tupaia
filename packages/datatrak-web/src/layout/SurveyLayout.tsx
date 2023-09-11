/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { Outlet, generatePath, useNavigate, useParams } from 'react-router';
import { SurveyParams } from '../types';
import { useSurveyForm } from '../features/Survey/SurveyContext';
import { useForm, FormProvider } from 'react-hook-form';
import { HEADER_HEIGHT, ROUTES, SURVEY_TOOLBAR_HEIGHT } from '../constants';
import styled from 'styled-components';
import { SIDE_MENU_WIDTH, SurveySideMenu } from '../features/Survey/SurveySideMenu';
import { Paper as MuiPaper } from '@material-ui/core';
import { Button } from '../components';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { CancelSurveyModal } from '../features/Survey/CancelSurveyModal';

const ScrollableLayout = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT} - ${SURVEY_TOOLBAR_HEIGHT});
  display: flex;
  flex-direction: column;
`;
const Wrapper = styled.div`
  display: flex;
  margin-left: -1rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
  overflow: hidden;
  flex: 1;
  align-items: flex-start;
`;

const Container = styled.div<{
  $sideMenuClosed?: boolean;
}>`
  display: flex;
  justify-content: center;
  height: 100%;
  flex: 1;
  position: relative;
  padding: 0 1rem;
  margin-left: ${({ $sideMenuClosed }) => ($sideMenuClosed ? `-${SIDE_MENU_WIDTH}` : 0)};
  transition: margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms;
`;

const Paper = styled(MuiPaper).attrs({
  variant: 'outlined',
  elevation: 0,
})`
  flex: 1;
  margin-left: 1rem;
  max-width: 63rem;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
`;
const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.palette.divider};

  button:last-child {
    margin-left: auto;
  }
`;

const ScrollBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 1rem 2.5rem;
  margin-bottom: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  button,
  a {
    &:last-child {
      margin-left: 1rem;
    }
  }
`;

/**
 * This layout is used for the survey screens as well as the review screen.
 */
export const SurveyLayout = () => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams<SurveyParams>();
  const {
    setFormData,
    formData,
    isLast,
    screenNumber,
    sideMenuOpen,
    numberOfScreens,
    isReviewScreen,
  } = useSurveyForm();
  const formContext = useForm({ defaultValues: formData });
  const { handleSubmit } = formContext;

  const handleStep = (path, data) => {
    setFormData({ ...formData, ...data });
    navigate(path);
  };

  const onStepPrevious = handleSubmit(data => {
    let path = ROUTES.SURVEY_SELECT;
    const prevScreenNumber = isReviewScreen ? numberOfScreens : screenNumber - 1;
    if (prevScreenNumber) {
      path = generatePath(ROUTES.SURVEY_SCREEN, {
        ...params,
        screenNumber: String(prevScreenNumber),
      });
    }

    handleStep(path, data);
  });

  const handleSubmitForm = data => {
    console.log('hello!', data);
  };

  const navigateNext = data => {
    const path = isLast
      ? generatePath(ROUTES.SURVEY_REVIEW, params)
      : generatePath(ROUTES.SURVEY_SCREEN, {
          ...params,
          screenNumber: String(screenNumber + 1),
        });
    handleStep(path, data);
  };

  const handleSubmitScreen = handleSubmit(data => {
    if (isReviewScreen) return handleSubmitForm(data);
    return navigateNext(data);
  });

  const openCancelModal = () => {
    setCancelModalOpen(true);
  };

  return (
    <ScrollableLayout>
      <FormProvider {...formContext}>
        <Wrapper>
          <SurveySideMenu />
          <Container $sideMenuClosed={!sideMenuOpen && !isReviewScreen}>
            <Paper>
              <Outlet />
              <FormActions>
                <Button
                  onClick={onStepPrevious}
                  startIcon={<ArrowBackIosIcon />}
                  variant="text"
                  color="default"
                >
                  Back
                </Button>
                <ButtonGroup>
                  <Button onClick={openCancelModal} variant="outlined">
                    Cancel
                  </Button>
                  <Button type="submit" onClick={handleSubmitScreen}>
                    {isReviewScreen ? 'Submit' : 'Next'}
                  </Button>
                </ButtonGroup>
              </FormActions>
            </Paper>
          </Container>
          <CancelSurveyModal open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} />
        </Wrapper>
      </FormProvider>
    </ScrollableLayout>
  );
};
