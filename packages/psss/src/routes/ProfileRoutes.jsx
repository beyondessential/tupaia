import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { ProfileTabView } from '../views/Tabs/ProfileTabView';
import { ChangePasswordTabView } from '../views/Tabs/ChangePasswordTabView';

export const ProfileRoutes = React.memo(() => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route exact path={match.path}>
        <ProfileTabView />
      </Route>
      <Route path={`${match.path}/change-password`}>
        <ChangePasswordTabView />
      </Route>
      <Redirect to={match.path} />
    </Switch>
  );
});
