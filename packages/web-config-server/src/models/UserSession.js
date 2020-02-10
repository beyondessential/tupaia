/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class UserSession extends BaseModel {
  static databaseType = TYPES.USER_SESSION;
  static fields = ['userName', 'accessToken', 'refreshToken', 'accessPolicy'];
}
