import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '../../../components';
import { useSurveyForm } from '../SurveyContext';

const FormActions = styled.div<{
  $hasBackButton: boolean;
}>`
  display: flex;
  justify-content: ${({ $hasBackButton }) => ($hasBackButton ? 'space-between' : 'flex-end')};
  align-items: center;
  padding-block: 1rem;
  padding-inline: 0.5rem;
  border-top: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  button:last-child {
    margin-inline-start: auto;
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
  const { isLast, isResubmit, isReviewScreen, openCancelConfirmation } = useSurveyForm();
  const { isLoading, onStepPrevious, hasBackButton } = useOutletContext<SurveyLayoutContextT>();

  const getNextButtonText = () => {
    if (isReviewScreen) return isResubmit ? 'Resubmit' : 'Submit';
    if (isLast) 'Review & submit';
    return 'Next';
  };

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
          {getNextButtonText()}
        </Button>
      </ButtonGroup>
    </FormActions>
  );
};
