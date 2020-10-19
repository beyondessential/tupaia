/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import Push from 'appcenter-push';
import { addMessage } from '../messages/actions';

export const linkPushNotificationsToReduxStore = store =>
  Push.setListener({
    onPushNotificationReceived: pushNotification => {
      const message = pushNotification.message;

      // When launching from push notifications, appcenter returns
      // null values for message and title.
      if (message) {
        store.dispatch(addMessage('push', message));
      }
    },
  });
