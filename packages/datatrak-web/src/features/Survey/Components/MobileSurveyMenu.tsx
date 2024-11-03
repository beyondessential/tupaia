/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { KeyboardArrowRight } from '@material-ui/icons';
import { IconButton as MuiIconButton } from '@material-ui/core';
import { useSurveyForm } from '../SurveyContext';
import { Button as UIButton, CopyIcon, ShareIcon, ContentsIcon } from '../../../components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  padding: 0 0.5rem;
  border-top: 1px solid ${props => props.theme.palette.divider};
`;

const IconButton = styled(MuiIconButton)`
  border-radius: 0;
  flex: 1;
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

export const MobileSurveyMenu = () => {
  const { toggleSideMenu, isLast, isReviewScreen, isResubmitReviewScreen } = useSurveyForm();

  const getNextButtonText = () => {
    if (isReviewScreen) return 'Submit';
    if (isResubmitReviewScreen) return 'Resubmit';
    if (isLast) {
      return 'Review';
    }
    return 'Next';
  };

  const handleShare = () => {
    console.log('Share');
  };

  const handleCopy = () => {
    console.log('Copy');
  };

  return (
    <Container>
      <IconButton onClick={toggleSideMenu}>
        <ContentsIcon />
      </IconButton>
      <IconButton onClick={handleShare}>
        <ShareIcon />
      </IconButton>
      <IconButton onClick={handleCopy}>
        <CopyIcon />
      </IconButton>
      <Button type="submit">{getNextButtonText()}</Button>
    </Container>
  );
};
