import React from 'react';
import styled from 'styled-components';
import { ActionsMenu } from '@tupaia/ui-components';
import { useSurveyResponseDrafts, useDeleteSurveyResponseDraft } from '../../api';
import { InlineScrollView, SurveyIcon, Tile, TileSkeleton } from '../../components';
import { useIsMobile } from '../../utils';
import { SectionHeading } from './SectionHeading';
import type { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';

const DraftSurveys = styled.section`
  display: grid;
  grid-area: --draftSurveys;
  grid-template-columns: subgrid;
  grid-template-rows: auto 1fr;
`;

const InlineScroll = styled(InlineScrollView).attrs({
  $gap: '1rem',
  as: 'ul',
  role: 'list',
})``;

const GridScroll = styled.div.attrs({
  as: 'ul',
  role: 'list',
})`
  column-gap: 1rem;
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: subgrid;
  row-gap: 0.6rem;
  grid-column: 1 / -1;
`;

type DraftSurvey = DatatrakWebSurveyResponseDraftsRequest.DraftSurveyResponse;

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
    <ActionsMenu
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      options={actions}
      includesIcons
    />
  );
};

const DraftSurveyTile = ({
  id,
  surveyName,
  surveyCode,
  countryCode,
  entityName,
  screenNumber,
}: DraftSurvey) => {
  return (
    <Tile
      heading={surveyName ?? 'Draft survey'}
      leadingIcons={<SurveyIcon />}
      trailingIcons={<Menu draftId={id} />}
      to={`/survey/${countryCode}/${surveyCode}/${screenNumber}?draftId=${id}`}
    >
      {entityName ?? countryCode}
    </Tile>
  );
};

export const DraftSurveysSection = () => {
  const { data: drafts = [], isLoading } = useSurveyResponseDrafts();
  const isMobile = useIsMobile();

  if (!isLoading && drafts.length === 0) return null;

  const ScrollableList = isMobile ? InlineScroll : GridScroll;

  const renderContents = () => {
    if (isLoading) return <TileSkeleton lineCount={1} />;

    return drafts.map(draft => (
      <li key={draft.id}>
        <DraftSurveyTile {...draft} />
      </li>
    ));
  };

  return (
    <DraftSurveys>
      <SectionHeading>My drafts</SectionHeading>
      <ScrollableList>{renderContents()}</ScrollableList>
    </DraftSurveys>
  );
};
