/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from './SectionHeading';
import { Leaderboard } from '../../features';

const Wrapper = styled.section`
  grid-area: leaderboard;
  display: flex;
  flex-direction: column;
`;

export const LeaderboardSection = () => {
  return (
    <Wrapper>
      <SectionHeading>Tupaia leaderboard</SectionHeading>
      <Leaderboard />
    </Wrapper>
  );
};
