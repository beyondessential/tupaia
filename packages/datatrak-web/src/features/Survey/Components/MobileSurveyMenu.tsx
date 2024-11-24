/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { KeyboardArrowRight, FormatListBulleted } from '@material-ui/icons';
import { IconButton as MuiIconButton } from '@material-ui/core';
import { generatePath, useParams } from 'react-router-dom';
import { useSurveyForm } from '../SurveyContext';
import { Button as UIButton, CopyIcon, ShareIcon } from '../../../components';
import { useCopySurveyUrl } from './CopySurveyUrlButton';
import { ROUTES } from '../../../constants';
import { useSurvey } from '../../../api';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  padding: 0 0.5rem;
  border-top: 1px solid ${props => props.theme.palette.divider};
  background: white;
`;

const IconButton = styled(MuiIconButton)`
  border-radius: 0;
  flex: 1;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Button = styled(UIButton).attrs({
  variant: 'text',
  color: 'default',
  endIcon: <KeyboardArrowRight />,
})`
  min-width: 8rem;
  flex: 1;
  border-radius: 0;
  border-left: 1px solid ${props => props.theme.palette.divider};
`;

const useShare = () => {
  const params = useParams();
  const { data: survey } = useSurvey(params.surveyCode);
  const path = generatePath(ROUTES.SURVEY, params);
  const link = `${window.location.origin}${path}`;

  return async () => {
    try {
      await navigator.share({
        title: document.title,
        text: `Tupaia Survey: ${survey?.name}`,
        url: link,
      });
    } catch (err) {
      // Swallow the error
      // Note that closing the share dialog will trigger the catch block
    }
  };
};

export const MobileSurveyMenu = () => {
  const { toggleSideMenu, isLast, isReviewScreen, isResubmitReviewScreen } = useSurveyForm();
  const copyPageUrl = useCopySurveyUrl({
    toastOptions: {
      anchorOrigin: {
        horizontal: 'center',
        vertical: 'bottom',
      },
    },
  });
  const share = useShare();

  const getNextButtonText = () => {
    if (isReviewScreen) return 'Submit';
    if (isResubmitReviewScreen) return 'Resubmit';
    if (isLast) {
      return 'Review';
    }
    return 'Next';
  };

  return (
    <Container>
      <IconButton onClick={toggleSideMenu}>
        <FormatListBulleted />
      </IconButton>
      <IconButton onClick={share}>
        <ShareIcon />
      </IconButton>
      <IconButton onClick={copyPageUrl}>
        <CopyIcon />
      </IconButton>
      <Button type="submit">{getNextButtonText()}</Button>
    </Container>
  );
};
