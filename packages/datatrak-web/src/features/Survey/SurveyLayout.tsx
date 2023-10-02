/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { Outlet, generatePath, useNavigate, useParams } from 'react-router';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Paper as MuiPaper } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { SurveyParams } from '../../types';
import { useSurveyForm } from './SurveyContext';
import { SIDE_MENU_WIDTH, SurveySideMenu, CancelSurveyModal } from './Components';
import {
  HEADER_HEIGHT,
  MOBILE_HEADER_HEIGHT,
  ROUTES,
  SURVEY_TOOLBAR_HEIGHT,
} from '../../constants';
import { Button } from '../../components';
import { useSubmitSurvey } from '../../api/mutations';

const ScrollableLayout = styled.div`
  height: calc(100vh - ${MOBILE_HEADER_HEIGHT} - ${SURVEY_TOOLBAR_HEIGHT});
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    height: calc(100vh - ${HEADER_HEIGHT} - ${SURVEY_TOOLBAR_HEIGHT});
  }
`;
const Wrapper = styled.div`
  display: flex;
  padding-top: 0.25rem;
  overflow: hidden;
  flex: 1;
  align-items: flex-start;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: -1rem;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
`;

const Container = styled.div<{
  $sideMenuClosed?: boolean;
}>`
  display: flex;
  justify-content: center;
  height: 100%;
  flex: 1;
  position: relative;
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
  position: relative;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: 1rem;
  }
`;

const Form = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem;
  border-top: 1px solid ${props => props.theme.palette.divider};
  button:last-child {
    margin-left: auto;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1rem;
  }
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

const BackButton = styled(Button).attrs({
  startIcon: <ArrowBackIosIcon />,
  variant: 'text',
  color: 'default',
})`
  ${({ theme }) => theme.breakpoints.down('md')} {
    padding-left: 0.8rem;
    .MuiButton-startIcon {
      margin-right: 0.25rem;
    }
  }
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
  const { mutate: submitSurvey, isLoading: isSubmittingSurvey } = useSubmitSurvey();

  const handleStep = (path, data) => {
    setFormData({ ...formData, ...data });
    navigate(path);
  };

  const onStepPrevious = handleSubmit(data => {
    let path = ROUTES.SURVEY_SELECT;
    const prevScreenNumber = isReviewScreen ? numberOfScreens : screenNumber! - 1;
    if (prevScreenNumber) {
      path = generatePath(ROUTES.SURVEY_SCREEN, {
        ...params,
        screenNumber: String(prevScreenNumber),
      });
    }

    handleStep(path, data);
  });

  const navigateNext = data => {
    const path = isLast
      ? generatePath(ROUTES.SURVEY_REVIEW, params)
      : generatePath(ROUTES.SURVEY_SCREEN, {
          ...params,
          screenNumber: String(screenNumber! + 1),
        });
    handleStep(path, data);
  };

  const handleSubmitScreen = handleSubmit(data => {
    if (isReviewScreen) return submitSurvey(data);
    return navigateNext(data);
  });

  const openCancelModal = () => {
    setCancelModalOpen(true);
  };

  const getNextButtonText = () => {
    if (isReviewScreen) return 'Submit';
    if (isLast) return 'Review and submit';
    return 'Next';
  };

  const nextButtonText = getNextButtonText();

  return (
    <ScrollableLayout>
      <FormProvider {...formContext}>
        <Wrapper>
          <SurveySideMenu />
          <Container $sideMenuClosed={!sideMenuOpen && !isReviewScreen}>
            <Paper>
              <Form onSubmit={handleSubmitScreen} noValidate>
                <Outlet />
                {isSubmittingSurvey && (
                  <LoadingContainer>
                    <SpinningLoader />
                  </LoadingContainer>
                )}
                <FormActions>
                  <BackButton onClick={onStepPrevious} disabled={isSubmittingSurvey}>
                    Back
                  </BackButton>
                  <ButtonGroup>
                    <Button
                      onClick={openCancelModal}
                      variant="outlined"
                      disabled={isSubmittingSurvey}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleSubmitScreen}
                      disabled={isSubmittingSurvey}
                    >
                      {nextButtonText}
                    </Button>
                  </ButtonGroup>
                </FormActions>
              </Form>
            </Paper>
          </Container>
          <CancelSurveyModal open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} />
        </Wrapper>
      </FormProvider>
    </ScrollableLayout>
  );
};
