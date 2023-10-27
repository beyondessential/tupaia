/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from './SectionHeading';

const Leaderboard = styled.section`
  grid-area: leaderboard;
  display: flex;
  flex-direction: column;
  height: 25rem;
`;

const ScrollBody = styled.div`
  overflow: auto;
  background: white;
  border-radius: 10px;
  flex: 1;
`;

export const LeaderboardSection = () => {
  return (
    <Leaderboard>
      <SectionHeading>Tupaia leaderboard</SectionHeading>
      <ScrollBody></ScrollBody>
    </Leaderboard>
  );
};
