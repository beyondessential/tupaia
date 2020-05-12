import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { NavBar, Footer, ExampleWithRedux } from './components';
import { PageRoutes } from './routes/PageRoutes';
import { LoginView } from './views/LoginView';
import { PrivateRoute } from './routes/PrivateRoute';

const App = () => (
  <Router>
    <ExampleWithRedux />
    <Switch>
      <Route path="/login">
        <LoginView />
      </Route>
      <PrivateRoute path="/">
        <NavBar />
        <PageRoutes />
        <Footer />
      </PrivateRoute>
    </Switch>
  </Router>
);


export default App;
