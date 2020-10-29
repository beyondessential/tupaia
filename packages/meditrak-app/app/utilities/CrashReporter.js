/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import Crashes from 'appcenter-crashes';
import { Client as BugsnagClient, Configuration as BugsnagConfig } from 'bugsnag-react-native';

// Handles crash reporting through Bugsnag and Appcenter. The two often have different
// and complementary information about a crash, so it is nice to keep both
export class CrashReporter {
  constructor(analytics) {
    const bugsnagConfig = new BugsnagConfig();
    bugsnagConfig.beforeSendCallbacks.push(this.addReduxStateToReport);
    this.bugsnag = new BugsnagClient(bugsnagConfig);
    this.reduxStore = null;

    // Record any prior crash in appcenter analytics
    if (!__DEV__) {
      (async () => {
        const didCrash = await Crashes.hasCrashedInLastSession();
        if (didCrash) {
          analytics.trackEvent('App crashed in last session');
        }
      })();
    }
  }

  injectReduxStore = reduxStore => {
    this.reduxStore = reduxStore;
  };

  addReduxStateToReport = report => {
    if (__DEV__ || !this.reduxStore) return false;
    const reduxState = this.reduxStore.getState();
    Object.entries(reduxState).forEach(([key, value]) => {
      report.addMetadata('reduxState', key, value);
    });
    return true;
  };

  setUser = (...args) => this.bugsnag.setUser(...args);

  clearUser = () => this.bugsnag.clearUser();
}
