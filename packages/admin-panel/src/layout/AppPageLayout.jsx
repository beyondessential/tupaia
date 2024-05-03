/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { labelToId } from '../utilities';
import { Main, PageWrapper } from './Page';
import { NavPanel } from './navigation';
import { ROUTES } from '../routes';

export const AppPageLayout = ({ user }) => {
  return (
    <PageWrapper>
      <NavPanel
        links={ROUTES.map(route => ({ ...route, id: `app-tab-${labelToId(route.label)}` }))}
        user={user}
        userLinks={[
          { label: 'Profile', to: '/profile' },
          { label: 'Logout', to: '/logout' },
        ]}
      />
      <Main>
        <Outlet />
      </Main>
    </PageWrapper>
  );
};

AppPageLayout.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
};
