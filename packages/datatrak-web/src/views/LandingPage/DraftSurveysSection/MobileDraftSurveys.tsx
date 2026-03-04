import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog, Slide, IconButton } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import type { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';
import { Trash2 } from 'lucide-react';
import { HEADER_HEIGHT } from '../../../constants';
import { useSurveyResponseDrafts, useDeleteSurveyResponseDraft } from '../../../api';
import { Button } from '../../../components';
import { DraftSurveyTile } from './DraftSurveyTile';
import { StickyMobileHeader } from '../../../layout';

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
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const ListWrapper = styled.div`
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  max-block-size: calc(100dvb - ${HEADER_HEIGHT});
  padding: 1rem;
`;

const ListItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  > span {
    flex: 1;

    > a {
      width: 100%;
    }

    svg {
      color: ${props => props.theme.palette.primary.main};
    }
  }
`;

const DraftList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const DeleteButton = styled(IconButton)``;

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

const ListItem = ({ draft }) => {
  const { mutate: deleteDraft, isLoading } = useDeleteSurveyResponseDraft(draft.id);

  return (
    <ListItemContainer>
      <DraftSurveyTile key={draft.id} {...draft} />
      <DeleteButton
        onClick={e => {
          e.preventDefault();
          if (!isLoading) {
            deleteDraft(draft.id);
          }
        }}
      >
        <Trash2 />
      </DeleteButton>
    </ListItemContainer>
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
              <ListItem draft={draft} />
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
