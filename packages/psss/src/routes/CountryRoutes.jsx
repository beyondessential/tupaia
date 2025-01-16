import React from 'react';
import { useRouteMatch, Redirect, Route, Switch } from 'react-router-dom';
import { EventBasedTabView } from '../views/Tabs/EventBasedTabView';
import { WeeklyCasesTabView } from '../views/Tabs/WeeklyCasesTabView';

export const CountryRoutes = React.memo(() => {
  const match = useRouteMatch();
  return (
    <Switch>
      <Route exact path={match.path}>
        <WeeklyCasesTabView />
      </Route>
      <Route path={`${match.path}/event-based`}>
        <EventBasedTabView />
      </Route>
      <Redirect to={match.path} />
    </Switch>
  );
});
