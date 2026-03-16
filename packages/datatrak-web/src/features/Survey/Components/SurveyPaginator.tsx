import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '../../../components';
import { useSurveyForm } from '../SurveyContext';
import { useSaveAsDraft } from '../hooks/useSaveAsDraft';

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
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
  gap: 1rem;
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
  const { saveAsDraft, isLoading: isSavingDraft } = useSaveAsDraft();

  const getNextButtonText = () => {
    if (isReviewScreen) return isResubmit ? 'Resubmit' : 'Submit';
    if (isLast) return 'Review & submit';
    return 'Next';
  };

  const isDisabled = isLoading || isSavingDraft;

  return (
    <FormActions>
      <ButtonGroup>
        {hasBackButton && (
          <BackButton onClick={onStepPrevious} disabled={isDisabled}>
            Back
          </BackButton>
        )}
        <Button onClick={saveAsDraft} variant="outlined" disabled={isDisabled}>
          Save &amp; exit
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button onClick={openCancelConfirmation} variant="outlined" disabled={isDisabled}>
          Cancel
        </Button>
        <Button type="submit" disabled={isDisabled}>
          {getNextButtonText()}
        </Button>
      </ButtonGroup>
    </FormActions>
  );
};
