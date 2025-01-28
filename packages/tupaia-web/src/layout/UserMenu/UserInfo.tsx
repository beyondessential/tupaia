import React from 'react';
import styled from 'styled-components';
import { LinkProps } from 'react-router-dom';
import { Tooltip as UITooltip } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT, MODAL_ROUTES } from '../../constants';
import { RouterButton } from '../../components';
import { User } from '../../types';

/**
 * UserInfo is a component that displays the user's name if user is logged in, or a register and sign in button if not set
 */
const Wrapper = styled.div`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const UsernameContainer = styled.p<{
  $isLandingPage?: boolean;
}>`
  padding-right: ${({ $isLandingPage }) => ($isLandingPage ? '0.6rem' : '5px')};
  margin: 0;
  font-weight: ${({ $isLandingPage, theme }) =>
    $isLandingPage ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular};
  font-size: 0.875rem;
  text-transform: ${({ $isLandingPage }) => ($isLandingPage ? 'uppercase' : 'none')};
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const Register = styled(RouterButton).attrs({
  variant: 'text',
})`
  text-transform: none;
  font-size: 0.875rem;
`;

const SignInButton = styled(RouterButton).attrs({
  variant: 'outlined',
  color: 'default',
})<
  LinkProps & {
    $secondaryColor?: string;
  }
>`
  font-size: 0.875rem;
  text-transform: none;
  background: none;
  border: 1px solid ${({ $secondaryColor }) => $secondaryColor};
  border-radius: 18px;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  height: 30px;
  margin-right: 1.3rem;
  padding-left: 1em;
  padding-right: 1em;
`;

const ProjectButton = styled(RouterButton).attrs({
  variant: 'text',
})`
  padding-inline: 0.3rem;

  .MuiButton-label {
    text-transform: none;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.palette.text.secondary};
    line-height: 1.4;
    transition: color 0.2s;
  }

  &:hover {
    background: none;
    .MuiButton-label {
      color: ${({ theme }) => theme.palette.text.primary};
      text-decoration: underline;
    }
  }
`;

// Wrap the button in a <span> to support the tooltip
const Tooltip = ({ children }) => (
  <UITooltip arrow interactive placement="top" title="Change project">
    <span>{children}</span>
  </UITooltip>
);

interface UserInfoProps {
  user?: User;
  isLandingPage?: boolean;
  secondaryColor?: string;
  isLoggedIn?: boolean;
}

/**
 * This is the username OR user buttons. These are only visible in desktop
 */
export const UserInfo = ({ user, isLandingPage, secondaryColor, isLoggedIn }: UserInfoProps) => {
  if (isLoggedIn) {
    const userName = user?.userName;
    const userProjectName = user?.project?.name || 'Explore';
    return (
      <UsernameContainer $isLandingPage={isLandingPage}>
        {userName}
        {!isLandingPage ? (
          <>
            {' '}
            |
            <Tooltip>
              <ProjectButton modal={MODAL_ROUTES.PROJECT_SELECT}>{userProjectName}</ProjectButton>
            </Tooltip>
          </>
        ) : null}
      </UsernameContainer>
    );
  }
  return (
    <Wrapper>
      <Register modal={MODAL_ROUTES.REGISTER}>Register</Register>
      <SignInButton modal={MODAL_ROUTES.LOGIN} $secondaryColor={secondaryColor}>
        Log in
      </SignInButton>
    </Wrapper>
  );
};
