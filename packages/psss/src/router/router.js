/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { HOME_ALIAS } from './routes';
import { Redirect, Route, Switch } from 'react-router-dom';

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
 * Use this component for any new section of routes (any config object that has a "routes" property
 */
// eslint-disable-next-line react/prop-types
export const RouterView = ({ routes }) => {
  const fallback = routes.find(route => route.fallback);
  return (
    <Switch>
      {routes.map((route, i) => {
        // eslint-disable-next-line react/no-array-index-key
        return <RouteWithSubRoutes key={i} {...route} />;
      })}
      {fallback && <Redirect to={fallback.path} />}
      <Route component={() => <h1>Not Found!</h1>} />
    </Switch>
  );
};

export const isActive = (match, location) => {
  if (!match) {
    return false;
  } else if (match.url === '') {
    const newPathnames = location.pathname.split('/').filter(x => x);
    return newPathnames[0] === HOME_ALIAS;
  }
  return location.pathname.indexOf(match.url) !== -1;
};
