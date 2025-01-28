import React from 'react';
import styled from 'styled-components';
import { ProfileButton as BaseProfileButton, ProfileButtonItem } from '@tupaia/ui-components';
import { useUser, useLogout } from '../api';
import { LoginLink } from './LoginLink';

const StyledProfileButton = styled(BaseProfileButton)`
  background: rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const ProfileLinks = () => {
  const { mutate: handleLogout } = useLogout();
  return (
    <ProfileButtonItem button onClick={handleLogout}>
      Logout
    </ProfileButtonItem>
  );
};

export const ProfileButton = () => {
  const { data: user, isLoggedIn } = useUser();
  return user && isLoggedIn ? (
    <StyledProfileButton
      user={{ ...user, name: `${user.firstName} ${user.lastName}` }}
      MenuOptions={ProfileLinks}
    />
  ) : (
    <LoginLink />
  );
};
