/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import { useRouteMatch } from 'react-router-dom';
import { Header, HeaderTitle, TabsToolbar } from '../components';
import { ProfileRoutes } from '../routes/ProfileRoutes';
import { getCurrentUser } from '../store';

const links = [
  {
    label: 'Profile',
    to: '',
    icon: <AccountCircleIcon />,
  },
  {
    label: 'Change Password',
    to: '/change-password',
    icon: <LockIcon />,
  },
];

export const ProfileViewComponent = ({ userName }) => {
  const match = useRouteMatch();
  return (
    <>
      <Header Title={<HeaderTitle title={userName} />} />
      <TabsToolbar links={links} baseRoute={match.url} />
      <ProfileRoutes />
    </>
  );
};

ProfileViewComponent.propTypes = {
  userName: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  userName: getCurrentUser(state).name,
});

export const ProfileView = connect(mapStateToProps)(ProfileViewComponent);
