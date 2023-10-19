/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from './SectionHeading';

const Leaderboard = styled.div`
  grid-area: leaderboard;
`;
export const LeaderboardSection = () => {
  return (
    <Leaderboard>
      <SectionHeading>Tupaia leaderboard</SectionHeading>
      <section></section>
    </Leaderboard>
  );
};
