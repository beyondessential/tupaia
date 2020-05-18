/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import { example, loadAlerts, getAlerts } from '../store/example';
import { login } from '../authentication';

const emailAddress = 'andres.oventi@gmail.com';
const password = 'koru225Zealandia';

const ExampleWithReduxComponent = ({ counter, alerts, increment, doLogin, doLoadAlerts }) => {
  const AlertList = () => {
    return <pre>{JSON.stringify(alerts, null, 2)}</pre>;
  };

  return (
    <div>
      ExampleWithRedux: {`${counter} `}
      <AlertList />
      <hr />
      <button type="button" onClick={increment}>
        increment
      </button>
      <button type="button" onClick={doLogin}>
        login
      </button>
      <button type="button" onClick={doLoadAlerts}>
        get alerts
      </button>
    </div>
  );
};

const mapStateToProps = state => ({
  counter: state.example.counter,
  alerts: getAlerts(state),
});
const mapDispatchToProps = dispatch => ({
  increment: () => dispatch(example()),
  doLogin: () => dispatch(login(emailAddress, password)),
  doLoadAlerts: () => dispatch(loadAlerts()),
});

export const ExampleWithRedux = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExampleWithReduxComponent);
