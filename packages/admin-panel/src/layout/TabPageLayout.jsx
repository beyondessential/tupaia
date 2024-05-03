/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { labelToId } from '../utilities';
import { PageContentWrapper } from './Page';
import { SecondaryNavbar } from './navigation';
import { Footer } from './Footer';

export const TabPageLayout = ({ routes, basePath }) => {
  return (
    <PageContentWrapper>
      <SecondaryNavbar
        // adding a key here is to force the component to re-render when the route changes. This is so that the link refs get regenerated and the scroll buttons work correctly when navigating between different routes
        key={basePath}
        links={routes?.map(childRoute => ({
          ...childRoute,
          id: `app-sub-view-${labelToId(childRoute.label)}`,
        }))}
        basePath={basePath}
      />
      <Outlet />
      <Footer />
    </PageContentWrapper>
  );
};

TabPageLayout.propTypes = {
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  basePath: PropTypes.string.isRequired,
};
