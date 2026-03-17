import React, { useState } from 'react';
import styled from 'styled-components';
import { ActionsMenu } from '@tupaia/ui-components';
import { SurveyIcon } from '../../../components';
import { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';
import { useDeleteSurveyResponseDraft } from '../../../api';
import { Tile } from '../../../components';
import { Typography } from '@material-ui/core';
import { DeleteDraftModal } from './DeleteDraftModal';

type DraftSurvey = DatatrakWebSurveyResponseDraftsRequest.DraftSurveyResponse;

const Wrapper = styled.li`
  display: flex;
  align-items: stretch;
  width: 100%;

  > span {
    flex: 1;

    > a.MuiButtonBase-root {
      width: 100%;
    }
  }

  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex: 1;
  }
`;

const StyledTile = styled(Tile)`
  flex: 1;
  min-width: 0;
  border-radius: 0.625rem 0 0 0.625rem;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    border-radius: 0.625rem;
  }
`;

const MenuContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0 0.625rem 0.625rem 0;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

const StyledActionsMenu = styled(ActionsMenu)``;

const StyledSurveyIcon = styled(SurveyIcon)`
  &.MuiSvgIcon-root {
    color: ${props => props.theme.palette.text.hint};
  }
`;

const TooltipText = styled.p`
  font-weight: normal;
  margin-block: 0;
  text-align: center;
  text-wrap: balance;
`;

const Menu = ({ draftId }: { draftId: string }) => {
  const { mutate: deleteDraft, isLoading } = useDeleteSurveyResponseDraft(draftId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const actions = [
    {
      label: 'Delete',
      action: () => setIsModalOpen(true),
      toolTipTitle: 'Delete draft',
    },
  ];

  return (
    <>
      <StyledActionsMenu
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        options={actions}
        includesIcons
      />
      <DeleteDraftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={() => {
          deleteDraft();
          setIsModalOpen(false);
        }}
        isLoading={isLoading}
      />
    </>
  );
};

export const DraftSurveyTile = ({
  id,
  surveyName,
  surveyCode,
  countryCode,
  entityName,
  screenNumber,
}: DraftSurvey) => {
  const entityText = entityName ?? countryCode;
  const tooltip = (
    <>
      <TooltipText>{surveyName}</TooltipText>
      <TooltipText>{entityText}</TooltipText>
    </>
  );
  return (
    <Wrapper>
      <StyledTile
        heading={surveyName ? `[draft] ${surveyName}` : 'Draft survey'}
        leadingIcons={<StyledSurveyIcon />}
        tooltip={tooltip}
        to={`/survey/${countryCode}/${surveyCode}/${screenNumber}?draftId=${id}`}
      >
        <Typography>{entityText}</Typography>
      </StyledTile>
      <MenuContainer>
        <Menu draftId={id} />
      </MenuContainer>
    </Wrapper>
  );
};
