/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useOutletContext } from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useSurveyForm } from '../SurveyContext';
import { Button } from '../../../components';
import { useIsMobile } from '../../../utils';

const FormActions = styled.div<{
  $hasBackButton: boolean;
}>`
  display: flex;
  justify-content: ${({ $hasBackButton }) => ($hasBackButton ? 'space-between' : 'flex-end')};
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
  float: right;
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

type SurveyLayoutContextT = {
  isLoading: boolean;
  onStepPrevious: () => void;
  hasBackButton: boolean;
};

export const SurveyPaginator = () => {
  const { isLast, isReviewScreen, openCancelConfirmation, isResubmitReviewScreen } =
    useSurveyForm();
  const isMobile = useIsMobile();
  const { isLoading, onStepPrevious, hasBackButton } = useOutletContext<SurveyLayoutContextT>();

  const getNextButtonText = () => {
    if (isReviewScreen) return 'Submit';
    if (isResubmitReviewScreen) return 'Resubmit';
    if (isLast) {
      return isMobile ? 'Review' : 'Review and submit';
    }
    return 'Next';
  };

  const nextButtonText = getNextButtonText();

  return (
    <FormActions $hasBackButton={hasBackButton}>
      {hasBackButton && (
        <BackButton onClick={onStepPrevious} disabled={isLoading}>
          Back
        </BackButton>
      )}
      <ButtonGroup>
        <Button onClick={openCancelConfirmation} variant="outlined" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {nextButtonText}
        </Button>
      </ButtonGroup>
    </FormActions>
  );
};
