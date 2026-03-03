import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog, Slide, IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { TransitionProps } from '@material-ui/core/transitions';
import { HEADER_HEIGHT } from '../../../constants';
import { useSurveyResponseDrafts, useDeleteSurveyResponseDraft } from '../../../api';
import { Button, SurveyIcon, Tile } from '../../../components';
import { StickyMobileHeader } from '../../../layout';
import type { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';

const Wrapper = styled.div`
  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

const ViewMoreButton = styled(Button).attrs({ variant: 'text', color: 'default' })`
  float: right;
  padding-block-start: 1rem;
`;

const ExpandedWrapper = styled.div`
  height: 100%;
`;

const ListWrapper = styled.div`
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  max-block-size: calc(100dvb - ${HEADER_HEIGHT});
  background-color: ${({ theme }) => theme.palette.background.default};
  padding: 1rem;
`;

const DraftList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const DraftItem = styled.li`
  position: relative;
`;

const StyledTile = styled(Tile)`
  padding-right: 4rem;
`;

const DeleteButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  z-index: 1;
`;

const TooltipText = styled.p`
  font-weight: normal;
  margin-block: 0;
  text-align: center;
  text-wrap: balance;
`;

type DraftSurvey = DatatrakWebSurveyResponseDraftsRequest.DraftSurveyResponse;

/**
 * Taken from [Material UI's example](https://v4.mui.com/components/dialogs/#full-screen-dialogs) to make the dialog slide up from the bottom
 */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DraftSurveyTile = ({
  id,
  surveyName,
  surveyCode,
  countryCode,
  entityName,
  screenNumber,
}: DraftSurvey) => {
  const { mutate: deleteDraft, isLoading } = useDeleteSurveyResponseDraft(id);
  const entityText = entityName ?? countryCode;
  const tooltip = (
    <>
      <TooltipText>{surveyName}</TooltipText>
      <TooltipText>{entityText}</TooltipText>
    </>
  );

  return (
    <DraftItem>
      <StyledTile
        heading={surveyName ?? 'Draft survey'}
        leadingIcons={<SurveyIcon />}
        tooltip={tooltip}
        to={`/survey/${countryCode}/${surveyCode}/${screenNumber}?draftId=${id}`}
      >
        {entityText}
      </StyledTile>
      <DeleteButton
        onClick={e => {
          e.preventDefault();
          if (!isLoading) {
            deleteDraft();
          }
        }}
        size="small"
      >
        <Delete />
      </DeleteButton>
    </DraftItem>
  );
};

const ExpandedList = ({ expanded, onClose }: { expanded: boolean; onClose: () => void }) => {
  const { data: drafts = [] } = useSurveyResponseDrafts();

  return (
    <Dialog
      open={expanded}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      fullScreen
    >
      <ExpandedWrapper>
        <StickyMobileHeader onBack={onClose}>My drafts</StickyMobileHeader>
        <ListWrapper>
          <DraftList>
            {drafts.map(draft => (
              <DraftSurveyTile key={draft.id} {...draft} />
            ))}
          </DraftList>
        </ListWrapper>
      </ExpandedWrapper>
    </Dialog>
  );
};

interface MobileDraftSurveysProps {
  drafts: DraftSurvey[];
}

export const MobileDraftSurveys = ({ drafts }: MobileDraftSurveysProps) => {
  const [expanded, setExpanded] = useState(false);

  if (drafts.length === 0) return null;

  return (
    <Wrapper>
      <ViewMoreButton onClick={() => setExpanded(true)}>View all drafts…</ViewMoreButton>
      <ExpandedList expanded={expanded} onClose={() => setExpanded(false)} />
    </Wrapper>
  );
};
