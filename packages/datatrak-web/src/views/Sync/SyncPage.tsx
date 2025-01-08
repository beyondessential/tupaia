import React from 'react';
import styled from 'styled-components';

import { format, formatRelative } from 'date-fns';
import { useNavigate } from 'react-router';
import { Button } from '../../components';
import { StickyMobileHeader } from '../../layout';
import { useIsMobile } from '../../utils';
import { SyncProgress } from './SyncProgress';

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
`;

const LayoutManager = styled.div`
  display: grid;
  grid-template-rows: 4fr auto 4fr;
`;

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  grid-row-start: 3;
  padding-bottom: calc(env(safe-area-inset-bottom, 0) + 1rem);
  padding-left: max(env(safe-area-inset-left, 0), 1rem);
  padding-right: max(env(safe-area-inset-right, 0), 1rem);
  text-align: center;

  > * {
    margin-block: 0;
    max-inline-size: min(100%, 20rem);
  }
`;

export const SyncPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const lastSyncDate: Date | null = new Date(new Date().valueOf() - Math.random() * 6e8); // TODO: Replace with query
  const isSyncing = true;

  return (
    <Wrapper>
      {isMobile && <StickyMobileHeader onClose={() => navigate(-1)}>Sync</StickyMobileHeader>}
      <LayoutManager>
        <Content>
          <picture>
            <source srcSet="/tupaia-pin.svg" />
            <img aria-hidden src="/tupaia-pin.svg" height={52} width={37} />
          </picture>
          <SyncProgress isSyncing={isSyncing} value={0.9} />
          {lastSyncDate === null ? (
            <p>Never synced before</p>
          ) : (
            <p>
              Synced{' '}
              <time dateTime={lastSyncDate.toISOString()} title={format(lastSyncDate, 'PPpp')}>
                {formatRelative(lastSyncDate, new Date(), { weekStartsOn: 1 })}
              </time>
            </p>
          )}
          <Button>Sync now</Button>
        </Content>
      </LayoutManager>
    </Wrapper>
  );
};
