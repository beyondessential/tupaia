import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { PageContentWrapper } from './Page';
import { SecondaryNavbar } from './navigation';
import { PageBody } from './PageBody';

export const TabPageLayout = ({
  routes,
  basePath,
  Footer,
  ContainerComponent = PageContentWrapper,
}) => {
  return (
    <ContainerComponent>
      <SecondaryNavbar
        // adding a key here is to force the component to re-render when the route changes. This is so that the link refs get regenerated and the scroll buttons work correctly when navigating between different routes
        key={basePath}
        links={routes}
        basePath={basePath}
      />
      <PageBody>
        <Outlet />
      </PageBody>
      {Footer}
    </ContainerComponent>
  );
};

TabPageLayout.propTypes = {
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string,
    }),
  ).isRequired,
  basePath: PropTypes.string,
  Footer: PropTypes.node.isRequired,
  ContainerComponent: PropTypes.elementType,
};

TabPageLayout.defaultProps = {
  basePath: '',
  ContainerComponent: undefined,
};
