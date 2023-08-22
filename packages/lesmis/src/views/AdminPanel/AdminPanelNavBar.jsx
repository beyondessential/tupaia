/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { HomeButton, NavBar } from '@tupaia/ui-components';
import { AdminPanelProfileButton } from './AdminPanelProfileButton';
import { useAdminPanelUrl } from '../../utils';

const isTabActive = (match, location) => {
  if (!match) {
    return false;
  }
  return location.pathname.indexOf(match.url) !== -1;
};

const StyledHomeButton = styled(HomeButton)`
  margin-top: 14px;
  margin-bottom: 14px;
`;

export const AdminPanelNavbar = ({ links, user }) => {
  const adminUrl = useAdminPanelUrl();

  return (
    <NavBar
      HomeButton={<StyledHomeButton source="/lesmis-logo-white.svg" homeUrl={adminUrl} />}
      links={links}
      Profile={() => <AdminPanelProfileButton user={user} />}
      isTabActive={isTabActive}
      maxWidth="xl"
    />
  );
};

AdminPanelNavbar.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({})),
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
};

AdminPanelNavbar.defaultProps = {
  links: [],
};
