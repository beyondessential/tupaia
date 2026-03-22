import React, { useState } from 'react';
import styled from 'styled-components';
import { ActionsMenu } from '@tupaia/ui-components';
import { SurveyIcon } from '../../../components';
import { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';
import { useDeleteSurveyResponseDraft } from '../../../api';
import { Tile } from '../../../components';
import { Typography } from '@material-ui/core';
import { displayDate } from '../../../utils';
import { DeleteDraftModal } from './DeleteDraftModal';

type DraftSurvey = DatatrakWebSurveyResponseDraftsRequest.DraftSurveyResponse;

type Variant = 'desktop' | 'mobile-scroll' | 'mobile-list';

interface WrapperProps {
  $variant: Variant;
}

const Wrapper = styled.div<WrapperProps>`
  display: flex;
  align-items: stretch;
  width: 100%;

  > span {
    flex: 1;

    > a.MuiButtonBase-root {
      width: 100%;
    }
  }

  ${({ $variant }) =>
    $variant === 'mobile-scroll' &&
    `
    flex: 0 0 auto;
    width: 14.75rem;
  `}
`;

const StyledTile = styled(Tile)<WrapperProps>`
  flex: 1;
  min-width: 0;
  border-radius: ${({ $variant }) =>
    $variant === 'desktop' ? '0.625rem 0 0 0.625rem' : '0.625rem'};
`;

const MenuContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0 0.625rem 0.625rem 0;
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

interface DraftSurveyTileProps extends DraftSurvey {
  variant?: Variant;
}

const MetadataText = styled(Typography)`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const DraftSurveyTile = ({
  id,
  surveyName,
  surveyCode,
  countryCode,
  countryName,
  entityName,
  screenNumber,
  updatedAt,
  variant = 'desktop',
}: DraftSurveyTileProps) => {
  const entityText = entityName ?? countryName ?? countryCode;
  const formattedDate = displayDate(updatedAt);
  const metadataText = [formattedDate, countryName, entityName].filter(Boolean).join(' | ');
  const tooltip = (
    <>
      <TooltipText>{surveyName}</TooltipText>
      <TooltipText>{entityText}</TooltipText>
    </>
  );

  const showMenu = variant === 'desktop';

  return (
    <Wrapper $variant={variant}>
      <StyledTile
        $variant={variant}
        heading={surveyName ? `[draft] ${surveyName}` : 'Draft survey'}
        leadingIcons={<StyledSurveyIcon />}
        tooltip={tooltip}
        to={`/survey/${countryCode}/${surveyCode}/${screenNumber}?draftId=${id}`}
      >
        {metadataText && <MetadataText>{metadataText}</MetadataText>}
      </StyledTile>
      {showMenu && (
        <MenuContainer>
          <Menu draftId={id} />
        </MenuContainer>
      )}
    </Wrapper>
  );
};
