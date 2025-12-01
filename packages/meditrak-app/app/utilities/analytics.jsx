import * as Analytics from 'appcenter-analytics';

// Disable analytics on dev builds.
if (__DEV__) {
  Analytics.setEnabled(false);
}

export const analytics = {
  trackEvent: (eventName, props = {}) => {
    const eventProps = { ...props };

    // Appcenter is sensitive to null values and object values,
    // flatten event props so that they are only numbers and strings.
    Object.keys(eventProps).forEach(key => {
      if (['string', 'number', 'boolean'].includes(typeof eventProps[key])) {
        return;
      }

      // Safe to recast because eventProps is a clone not a direct
      // reference of the object passed.
      eventProps[key] = String(eventProps[key]);
    });
    Analytics.trackEvent(eventName, eventProps);
  },
  trackButtonPress: label => {
    analytics.trackEvent('Pressed button', { label });
  },
};
