import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { IconButton as MuiIconButton } from '@material-ui/core';
import { FormatListBulleted, KeyboardArrowRight } from '@material-ui/icons';

import { CopyIcon, ShareIcon, Button as UIButton } from '../../../components';
import { useSurveyForm } from '../SurveyContext';
import { useShare } from '../utils/useShare';
import { useCopySurveyUrl } from './CopySurveyUrlButton';

const Container = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  height: ${MOBILE_SURVEY_MENU_HEIGHT};
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
  border-inline-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  border-radius: 0;
  flex: 1;
  min-inline-size: 8rem;
  padding-block: 1.2rem;
`;

export const MobileSurveyMenu = (props: HTMLAttributes<HTMLDivElement>) => {
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
    if (isLast) return 'Review';
    return 'Next';
  };

  return (
    <Container {...props}>
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
