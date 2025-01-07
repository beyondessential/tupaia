import React from 'react';
import styled from 'styled-components';

import { Button } from '../../components';
import { SyncProgress } from './SyncProgress';
import { HEADER_HEIGHT } from '../../constants';

const Wrapper = styled.div`
  block-size: calc(100vb - ${HEADER_HEIGHT} - 1px); // TODO: Refactor main page layout to grid
  display: grid;
  grid-template-rows: 2fr auto 3fr;
`;

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  grid-row-start: 2;

  > * {
    margin: 0;
    max-inline-size: min(100%, 20rem);
  }
`;

export const SyncPage = () => {
  return (
    <Wrapper>
      <Content>
        <picture>
          <source srcSet="/tupaia-pin.svg" />
          <img aria-hidden src="/tupaia-pin.svg" height={52} width={37} />
        </picture>

        <SyncProgress value={0.9} />
        <Button>Sync now</Button>
      </Content>
    </Wrapper>
  );
};
