/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { reducer as authentication } from './authentication';
import { reducer as assessment } from './assessment';
import { reducer as navigation, sideMenuReducer as sideMenu } from './navigation';
import { reducer as sync } from './sync';
import { reducer as version } from './version';
import { reducer as newUser } from './user';
import { reducer as country } from './country';
import { reducer as social } from './social';
import { reducer as web } from './web';
import { reducer as userLocation } from './utilities/userLocation';
import { reducer as rewards } from './rewards';
import { reducer as messages } from './messages';
import { reducer as entity } from './entityMenu';
import { reducer as changePassword } from './changePassword';

export const reducers = {
  authentication,
  assessment,
  navigation,
  sync,
  version,
  newUser,
  sideMenu,
  country,
  social,
  web,
  userLocation,
  rewards,
  messages,
  entity,
  changePassword,
};
