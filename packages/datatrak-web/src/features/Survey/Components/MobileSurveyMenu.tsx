import { IconButton } from '@material-ui/core';
import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { FormatListBulleted, KeyboardArrowRight } from '@material-ui/icons';

import { ShareIcon, Button as UIButton } from '../../../components';
import { BOTTOM_NAVIGATION_HEIGHT_DYNAMIC } from '../../../constants';
import { useSurveyForm } from '../SurveyContext';
import { useShare } from '../utils/useShare';
import { useSaveAsDraft } from '../hooks/useSaveAsDraft';

const Container = styled.nav`
  align-items: stretch;
  background: white;
  border-block-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  display: grid;
  grid-template-columns: minmax(min-content, 1.5fr) repeat(2, minmax(3.5rem, 1fr)) minmax(
      min-content,
      1.5fr
    );
  inline-size: 100%;
  inset-block-end: 0;
  justify-content: space-between;
  min-block-size: 3.5rem;
  position: fixed;
  touch-action: pan-x pinch-zoom;

  & > .MuiButtonBase-root {
    --min-padding: 0.75rem;
    block-size: ${BOTTOM_NAVIGATION_HEIGHT_DYNAMIC};
    border-radius: 0;
    height: 100%;
    padding: var(--min-padding);
    padding-bottom: max(env(safe-area-inset-bottom, 0), var(--min-padding));
  }

  .MuiSvgIcon-root {
    color: ${props => props.theme.palette.text.primary};
  }
`;

const SubmitButton = styled(UIButton).attrs({
  variant: 'text',
  color: 'default',
})`
  border-inline-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  padding-right: max(env(safe-area-inset-right, 0), var(--min-padding));
  border-radius: 0;
`;

const SaveButton = styled(SubmitButton).attrs({
  variant: 'text',
  color: 'default',
})`
  border-inline-end: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  padding-left: max(env(safe-area-inset-left, 0), var(--min-padding));
  white-space: nowrap;
`;

export const MobileSurveyMenu = (props: HTMLAttributes<HTMLDivElement>) => {
  const { toggleSideMenu, isLast, isResubmit, isReviewScreen, isSuccessScreen } = useSurveyForm();
  const share = useShare();
  const { saveAsDraft, isLoading: isSavingDraft } = useSaveAsDraft();

  const getNextButtonText = () => {
    if (isReviewScreen) return isResubmit ? 'Resubmit' : 'Submit';
    if (isLast) return 'Review';
    return 'Next';
  };

  const showSaveExit = !isSuccessScreen;

  return (
    <Container {...props}>
      {showSaveExit && (
        <SaveButton onClick={saveAsDraft} disabled={isSavingDraft} title="Save & exit">
          Save & exit
        </SaveButton>
      )}
      <IconButton onClick={toggleSideMenu}>
        <FormatListBulleted />
      </IconButton>
      <IconButton onClick={share}>
        <ShareIcon />
      </IconButton>
      <SubmitButton type="submit" endIcon={<KeyboardArrowRight />}>
        {getNextButtonText()}
      </SubmitButton>
    </Container>
  );
};
