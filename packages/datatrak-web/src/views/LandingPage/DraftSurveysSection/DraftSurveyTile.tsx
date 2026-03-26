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

type Variant = 'desktop' | 'mobile-scroll' | 'mobile-list';

interface WrapperProps {
  $variant: Variant;
}

const Wrapper = styled.div<WrapperProps>`
  display: flex;
  align-items: stretch;
  width: 100%;
  border-radius: 0.625rem;

  > span {
    flex: 1;

    > a.MuiButtonBase-root {
      width: 100%;
    }
  }
  background-color: ${({ theme }) => theme.palette.background.paper};

  &:hover {
    background-color: ${({ theme }) => theme.palette.primaryHover};
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
  background: none;
  transition: none;
  padding-block: 0.5rem;

  h3.MuiTypography-root {
    margin-block-end: 0.2rem;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    min-height: 4.8rem;
    padding-block: 0;
  }
`;

const MenuContainer = styled.div`
  display: flex;
  align-items: center;
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
  &.MuiTypography-root {
    font-size: 0.75rem;
    line-height: 1.1;
    color: ${({ theme }) => theme.palette.text.secondary};
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    ${({ theme }) => theme.breakpoints.down('sm')} {
      min-height: calc(0.75rem * 1.1 * 2);
    }
  }
`;

const formatDraftDate = (date?: Date | string | null) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
  });
};

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
  const formattedDate = formatDraftDate(updatedAt);
  const metadataText = [formattedDate, entityName, countryName].filter(Boolean).join('\u00a0| ');

  const headingText = surveyName ? `[draft] ${surveyName}` : 'Draft survey';
  const showMenu = variant === 'desktop';

  const tooltip =
    variant === 'desktop' ? (
      <>
        <TooltipText>{surveyName}</TooltipText>
        <TooltipText>{entityName ?? countryName}</TooltipText>
      </>
    ) : undefined;

  return (
    <Wrapper $variant={variant}>
      <StyledTile
        $variant={variant}
        heading={headingText}
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
