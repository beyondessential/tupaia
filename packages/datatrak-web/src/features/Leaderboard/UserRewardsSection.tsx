import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Coconut, Pig } from '../../components';
import { UserRewards } from '../../types';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 0.6rem 2rem;
  border-bottom: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1.5rem 2.2rem;
  }
`;

const UserRewardItem = styled.div`
  display: flex;
  align-items: center;
  & + & {
    margin-left: 2.8rem;
  }
  svg {
    font-size: 1.3rem;
    ${({ theme }) => theme.breakpoints.up('md')} {
      font-size: 1.8rem;
    }
  }
`;

const UserRewardCount = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-left: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

const AnimatedPig = styled(Pig)`
  animation-name: --wiggle;
  animation-duration: 5s;
  animation-iteration-count: infinite;
  @keyframes --wiggle {
    // do the wiggle animation within 15% and the rest will be the delay between the wiggles
    0% {
      transform: rotate(0deg);
    }
    2% {
      transform: rotate(10deg);
    }
    4% {
      transform: rotate(-10deg);
    }
    6% {
      transform: rotate(0deg);
    }
    9% {
      transform: rotate(10deg);
    }
    12% {
      transform: rotate(-10deg);
    }
    15% {
      transform: rotate(0deg);
    }
  }

  // stop the animation on desktop
  ${({ theme }) => theme.breakpoints.up('md')} {
    animation: none;
  }
`;

export const UserRewardsSection = ({ pigs: pigCount, coconuts: coconutCount }: UserRewards) => {
  console.log(typeof pigCount, typeof coconutCount);
  const pigUnit = pigCount === 1 ? 'pig' : 'pigs';
  const coconutUnit = coconutCount === 1 ? 'coconut' : 'coconuts';
  return (
    <Wrapper>
      <UserRewardItem>
        <Coconut />
        <UserRewardCount>
          {coconutCount}&nbsp;{coconutUnit}
        </UserRewardCount>
      </UserRewardItem>
      <UserRewardItem>
        <AnimatedPig />
        <UserRewardCount>
          {pigCount}&nbsp;{pigUnit}
        </UserRewardCount>
      </UserRewardItem>
    </Wrapper>
  );
};
