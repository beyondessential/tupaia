import { IconButton } from '@material-ui/core';
import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { FormatListBulleted, KeyboardArrowRight } from '@material-ui/icons';

import { ShareIcon, Button as UIButton } from '../../../components';
import { useSurveyForm } from '../SurveyContext';
import { useShare } from '../utils/useShare';
import { CopyUrlButton } from './CopyUrlButton';

const Container = styled.div`
  align-items: stretch;
  background: white;
  block-size: calc(env(safe-area-inset-bottom, 0) + 3.5rem);
  border-block-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  display: grid;
  grid-template-columns: repeat(3, minmax(3.5rem, 1fr)) minmax(min-content, 1.5fr);
  inline-size: 100%;
  inset-block-end: 0;
  justify-content: space-between;
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
  position: fixed;
  touch-action: pan-x pinch-zoom;

  & > button {
    border-radius: 0;
  }
`;

const StyledCopyUrlButton = styled(CopyUrlButton).attrs({ noTooltip: true })`
  border-radius: 0;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Button = styled(UIButton).attrs({
  variant: 'text',
  color: 'default',
  endIcon: <KeyboardArrowRight />,
})`
  border-inline-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  border-radius: 0;
  padding-block: 1.2rem;
`;

export const MobileSurveyMenu = (props: HTMLAttributes<HTMLDivElement>) => {
  const { toggleSideMenu, isLast, isResubmit, isReviewScreen } = useSurveyForm();
  const share = useShare();

  const getNextButtonText = () => {
    if (isReviewScreen) return isResubmit ? 'Resubmit' : 'Submit';
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
      <StyledCopyUrlButton />
      <Button type="submit">{getNextButtonText()}</Button>
    </Container>
  );
};
