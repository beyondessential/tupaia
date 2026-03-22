import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog, Slide, IconButton } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import type { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';
import { Trash2 } from 'lucide-react';
import { HEADER_HEIGHT } from '../../../constants';
import { useDeleteSurveyResponseDraft } from '../../../api';
import { Button } from '../../../components';
import { DraftSurveyTile } from './DraftSurveyTile';
import { StickyMobileHeader } from '../../../layout';
import { DeleteDraftModal } from './DeleteDraftModal';

const Wrapper = styled.div`
  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

const ViewMoreButton = styled(Button).attrs({ variant: 'text', color: 'default' })`
  font-size: 0.75rem;
  padding: 0;
  min-width: auto;
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

const ListItemContainer = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.625rem;
`;

const DraftList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const DeleteButton = styled(IconButton)`
  color: ${props => props.theme.palette.primary.main};
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

const ListItem = ({ draft }) => {
  const { mutate: deleteDraft, isLoading } = useDeleteSurveyResponseDraft(draft.id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ListItemContainer>
      <DraftSurveyTile {...draft} variant="mobile-list" />
      <DeleteButton
        aria-label="Delete draft"
        onClick={e => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
      >
        <Trash2 />
      </DeleteButton>
      <DeleteDraftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={() => {
          deleteDraft();
          setIsModalOpen(false);
        }}
        isLoading={isLoading}
      />
    </ListItemContainer>
  );
};

const ExpandedList = ({
  expanded,
  onClose,
  drafts,
  fetchNextPage,
  hasNextPage,
}: {
  expanded: boolean;
  onClose: () => void;
  drafts: DraftSurvey[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
}) => {
  // Load all remaining pages when the dialog opens
  React.useEffect(() => {
    if (expanded && hasNextPage) {
      fetchNextPage();
    }
  }, [expanded, hasNextPage, fetchNextPage]);

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
              <ListItem key={draft.id} draft={draft} />
            ))}
          </DraftList>
        </ListWrapper>
      </ExpandedWrapper>
    </Dialog>
  );
};

interface MobileDraftSurveysProps {
  drafts: DraftSurvey[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
}

export const MobileDraftSurveys = ({
  drafts,
  fetchNextPage,
  hasNextPage,
}: MobileDraftSurveysProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (drafts.length === 0) return null;

  return (
    <Wrapper>
      <ViewMoreButton onClick={() => setIsOpen(true)}>View all / edit</ViewMoreButton>
      <ExpandedList
        expanded={isOpen}
        onClose={() => setIsOpen(false)}
        drafts={drafts}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
      />
    </Wrapper>
  );
};
