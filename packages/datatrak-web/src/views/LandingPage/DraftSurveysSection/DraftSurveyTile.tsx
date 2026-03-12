import React from 'react';
import styled from 'styled-components';
import { ActionsMenu } from '@tupaia/ui-components';
import { SurveyIcon } from '../../../components';
import { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';
import { useDeleteSurveyResponseDraft } from '../../../api';
import { Tile } from '../../../components';
import { Typography } from '@material-ui/core';

type DraftSurvey = DatatrakWebSurveyResponseDraftsRequest.DraftSurveyResponse;

const StyledActionsMenu = styled(ActionsMenu)`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 1;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

const StyledSurveyIcon = styled(SurveyIcon)`
  &.MuiSvgIcon-root {
    color: ${props => props.theme.palette.text.hint};
  }
`;

const StyledTile = styled(Tile)`
  padding-right: 2.2rem;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-right: 1rem;
    flex: 1;
    span {
      flex: 1;
    }
    a {
      width: 100%;
    }
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

  const actions = [
    {
      label: 'Delete',
      action: () => {
        if (isLoading) return;
        deleteDraft();
      },
      toolTipTitle: 'Delete draft',
    },
  ];

  return (
    <StyledActionsMenu
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      options={actions}
      includesIcons
    />
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
    <StyledTile
      heading={surveyName ? `[draft]${surveyName}` : 'Draft survey'}
      leadingIcons={<StyledSurveyIcon />}
      tooltip={tooltip}
      to={`/survey/${countryCode}/${surveyCode}/${screenNumber}?draftId=${id}`}
    >
      <Typography>{entityText}</Typography>
      <Menu draftId={id} />
    </StyledTile>
  );
};
