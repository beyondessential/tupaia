import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { HEADER_HEIGHT } from '../../constants';
import { IconButton, Typography } from '@material-ui/core';
import { useCurrentUserContext } from '../../api';
import { ChangeProjectButton } from '../../components';

const Wrapper = styled.div`
  height: ${HEADER_HEIGHT};
  display: flex;
  align-items: center;
  max-width: 80%;
  padding-block: 1rem;

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

const Logo = styled(IconButton)<{
  component: React.ElementType;
  to: string;
}>`
  padding: 0;

  img {
    max-height: 2rem;
  }
`;

const UserDetailsContainer = styled.div`
  margin-inline-start: 0.5rem;
  height: 100%;
  overflow: hidden;
`;

const UserName = styled(Typography)`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  // this is a hack to make a responsive width become pixel based so that we can apply text-overflow: ellipsis
  max-width: calc(100%);
`;

export const MobileHeaderLeft = ({ onClickLogo }) => {
  const { isLoggedIn, projectId, fullName } = useCurrentUserContext();

  if (isLoggedIn) {
    return (
      <Wrapper>
        <Logo onClick={onClickLogo} component={RouterLink} to="/">
          <img src="/mobile-logo.svg" alt="Tupaia Datatrak logo" width="100%" height="100%" />
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
        <img src="/datatrak-logo-black.svg" alt="Tupaia Datatrak logo" width="100%" height="100%" />
      </Logo>
    </Wrapper>
  );
};
