/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Render a route with potential sub routes
 * https://reacttraining.com/react-router/web/example/route-config
 */
export const RouteWithSubRoutes = route => {
  return (
    <Route
      path={route.path}
      exact={route.exact}
      render={props => (
        <route.component {...props} routes={route.routes} metaData={route.metaData} />
      )}
    />
  );
};

/**
 * Renders a section of routes
 */
export const RouterView = ({ routes }) => {
  const fallback = routes.find(route => route.fallback);
  return (
    <Switch>
      {routes.map(route => {
        return <RouteWithSubRoutes key={route.path} {...route} />;
      })}
      {fallback && <Redirect to={fallback.path} />}
      <Route component={() => <h1>Not Found!</h1>} />
    </Switch>
  );
};

RouterView.propTypes = {
  routes: PropTypes.array.isRequired,
};

/*
 * This ensures that the link to the home page is active for sub-urls of country (eg. /country/samoa)
 */
export const HOME_ALIAS = 'country';

/*
 * Used to determine if a router link is active
 */
export const isActive = (match, location) => {
  if (!match) {
    return false;
  } else if (match.url === '') {
    const newPathnames = location.pathname.split('/').filter(x => x);
    return newPathnames[0] === HOME_ALIAS;
  }
  return location.pathname.indexOf(match.url) !== -1;
};
