/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Coconut, Pig } from '../../components';
import { UserRewards } from '../../types';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 1.1rem 2rem;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  ${({ theme }) => theme.breakpoints.up('lg')} {
    padding: 1.7rem 2.2rem;
  }
`;

const UserRewardItem = styled.div`
  display: flex;
  align-items: center;
  & + & {
    margin-left: 2.8rem;
  }
  svg {
    font-size: 1.8rem;
  }
`;

const UserRewardCount = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-left: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

interface UserRewardsSectionProps extends UserRewards {
  isLoading: boolean;
}
export const UserRewardsSection = ({ pigs, coconuts, isLoading }: UserRewardsSectionProps) => {
  if (isLoading) return null;
  return (
    <Wrapper>
      <UserRewardItem>
        <Pig />
        <UserRewardCount>{pigs} Pigs</UserRewardCount>
      </UserRewardItem>
      <UserRewardItem>
        <Coconut />
        <UserRewardCount>{coconuts} Coconuts</UserRewardCount>
      </UserRewardItem>
    </Wrapper>
  );
};
