import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../../components';
import { ROUTES } from '../../../constants';
import { useSurveyForm } from '../SurveyContext';
import { useCurrentUserContext } from '../../../api';
import { useNavigationBlockerContext } from '../../../utils';
import { useSaveAsDraft } from '../hooks/useSaveAsDraft';
import { SaveAndExitModal } from './SaveAndExitModal';

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
  const { isLast, isResubmit, isReviewScreen } = useSurveyForm();
  const { isLoading, onStepPrevious, hasBackButton } = useOutletContext<SurveyLayoutContextT>();
  const navigate = useNavigate();
  const { isLoggedIn } = useCurrentUserContext();
  const { disableAll: disableNavigationBlockers } = useNavigationBlockerContext();
  const { saveAsDraft, isLoading: isSavingDraft } = useSaveAsDraft(() => navigate('/'));
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleSaveAndExit = async () => {
    disableNavigationBlockers();
    await saveAsDraft();
  };

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
        {isLoggedIn && (
          <Button onClick={() => setIsSaveModalOpen(true)} variant="outlined" disabled={isDisabled}>
            Save &amp; exit
          </Button>
        )}
      </ButtonGroup>
      <ButtonGroup>
        <Button onClick={() => navigate(ROUTES.HOME)} variant="outlined" disabled={isDisabled}>
          Cancel
        </Button>
        <Button type="submit" disabled={isDisabled}>
          {getNextButtonText()}
        </Button>
      </ButtonGroup>
      {isLoggedIn && (
        <SaveAndExitModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSaveAndExit}
          isLoading={isSavingDraft}
        />
      )}
    </FormActions>
  );
};
