import { IconButton, Typography } from '@material-ui/core';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

import { useCurrentUserContext } from '../../api';
import { ChangeProjectButton, DataTrakLogotype } from '../../components';
import { HEADER_HEIGHT } from '../../constants';

const Wrapper = styled.div`
  align-items: center;
  block-size: ${HEADER_HEIGHT};
  display: flex;
  max-inline-size: 80%;
  padding-block: 1rem;
  gap: 0.25rem;

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

const Logo = styled(IconButton)<{
  component: React.ElementType;
  to: string;
}>`
  padding: 0.5rem;

  img {
    max-block-size: 2rem;
  }
`;

const UserDetailsContainer = styled.div`
  block-size: 100%;
  overflow: hidden;
`;

const UserName = styled(Typography)`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  // this is a hack to make a responsive width become pixel based so that we can apply text-overflow: ellipsis
  max-inline-size: calc(100%);
`;

export const MobileHeaderLeft = ({ onClickLogo }) => {
  const { isLoggedIn, projectId, fullName } = useCurrentUserContext();

  if (isLoggedIn) {
    return (
      <Wrapper>
        <Logo onClick={onClickLogo} component={RouterLink} to="/">
          <img src="/datatrak-pin.svg" alt="Tupaia DataTrak – Home" width="100%" height="100%" />
        </Logo>
        {isLoggedIn && (
          <UserDetailsContainer>
            <UserName>{fullName}</UserName>
            {projectId && <ChangeProjectButton />}
          </UserDetailsContainer>
        )}
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Logo onClick={onClickLogo} component={RouterLink} to="/">
        <DataTrakLogotype titleAccess="Tupaia DataTrak" width="100%" height="100%" />
      </Logo>
    </Wrapper>
  );
};
