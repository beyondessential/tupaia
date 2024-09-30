/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { InfiniteActivityFeed } from './InfiniteActivityFeed';
import { DESKTOP_MEDIA_QUERY } from '../../../constants';

const Wrapper = styled.div`
  display: none;
  height: 100%;
  overflow: hidden;
  flex: 1;
  ${DESKTOP_MEDIA_QUERY} {
    display: flex;
  }
`;

export const DesktopActivityFeed = () => {
  return (
    <Wrapper>
      <InfiniteActivityFeed />
    </Wrapper>
  );
};
