import React from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { Button } from '../../components';
import { StickyMobileHeader } from '../../layout';
import { useIsMobile } from '../../utils';
import { LastSyncDate } from './LastSyncDate';
import { SyncStatus } from './SyncStatus';

const Wrapper = styled.div`
  block-size: 100vb;
  display: grid;
  grid-template-rows: auto 1fr;
`;

const LayoutManager = styled.div`
  display: grid;
  grid-row-start: 2;
  grid-template-areas: '.' '--content' '.';
  grid-template-rows: 3fr auto 4fr;
`;

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  grid-area: --content;
  padding-bottom: calc(env(safe-area-inset-bottom, 0) + 1rem);
  padding-left: max(env(safe-area-inset-left, 0), 1.5rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.5rem);
  padding-top: 1rem;
  text-align: center;

  > * {
    max-inline-size: min(100%, 20rem);
  }
`;

const StyledSyncStatus = styled(SyncStatus)`
  margin-block-start: 1rem;
  font-variant-numeric: lining-nums tabular-nums;
`;

const StyledLastSyncDate = styled(LastSyncDate)`
  margin-block-start: 2.25rem;
`;

const StyledButton = styled(Button)`
  margin-block-start: 2.25rem;
`;

export const SyncPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // <PLACEHOLDERS> TODO: Replace with queries or props
  const lastSyncDate: Date | null = new Date(new Date().valueOf() - Math.random() * 1e9);
  const syncProgress: number | null = 0.77;
  // </PLACEHOLDERS>

  return (
    <Wrapper>
      {isMobile && <StickyMobileHeader onClose={() => navigate(-1)}>Sync</StickyMobileHeader>}
      <LayoutManager>
        <Content>
          <picture>
            <source srcSet="/tupaia-pin.svg" />
            <img aria-hidden src="/tupaia-pin.svg" height={52} width={37} />
          </picture>
          <StyledSyncStatus value={syncProgress} />
          <StyledLastSyncDate date={lastSyncDate} />
          <StyledButton>Sync now</StyledButton>
        </Content>
      </LayoutManager>
    </Wrapper>
  );
};
