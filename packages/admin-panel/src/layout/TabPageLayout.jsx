import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { PageContentWrapper } from './Page';
import { SecondaryNavbar } from './navigation';
import { PageBody } from './PageBody';
import {
  ALL_PROJECTS_SCOPE,
  SCOPE_QUERY_PARAM,
  SINGLE_PROJECT_SCOPE,
  appendScopeToPath,
  isInScope,
} from '../routes/scopes';

const VALID_SCOPES = [ALL_PROJECTS_SCOPE, SINGLE_PROJECT_SCOPE];

const findChildForPath = (routes, basePath, pathname) =>
  routes.find(route => {
    const target = route.exact ? route.path : `${basePath}${route.path}`;
    return target === pathname;
  });

export const TabPageLayout = ({
  routes,
  basePath,
  Footer,
  ContainerComponent = PageContentWrapper,
}) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const scope = searchParams.get(SCOPE_QUERY_PARAM);
  const isValidScope = scope && VALID_SCOPES.includes(scope);

  const visibleRoutes = useMemo(() => {
    if (!isValidScope) return routes;
    const filtered = routes.filter(route => isInScope(route, scope));
    return filtered.length > 0 ? filtered : routes;
  }, [routes, scope, isValidScope]);

  if (isValidScope) {
    const currentChild = findChildForPath(routes, basePath, location.pathname);
    if (currentChild && !isInScope(currentChild, scope)) {
      const target = visibleRoutes[0];
      if (target) {
        const targetPath = target.exact ? target.path : `${basePath}${target.path}`;
        return <Navigate to={appendScopeToPath(targetPath, scope)} replace />;
      }
    }
  }

  return (
    <ContainerComponent>
      <SecondaryNavbar
        // adding a key here is to force the component to re-render when the route changes. This is so that the link refs get regenerated and the scroll buttons work correctly when navigating between different routes
        key={`${basePath}-${scope ?? 'none'}`}
        links={visibleRoutes}
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
