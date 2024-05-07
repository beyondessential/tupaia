/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { NavPanel } from '@tupaia/admin-panel';
import { useAdminPanelUrl } from '../../utils';

export const AdminPanelNavbar = ({ links, user }) => {
  const adminUrl = useAdminPanelUrl();

  return (
    <NavPanel
      logo={{
        url: '/lesmis-logo-white.svg',
        alt: 'LESMIS Admin Panel Logo',
      }}
      homeLink={adminUrl}
      links={links}
      user={user}
      userLinks={[
        {
          label: 'Logout',
          to: `${adminUrl}/logout`,
        },
      ]}
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
