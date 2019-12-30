/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { BaseModel } from './BaseModel';

export class UserSession extends BaseModel {
  static databaseType = 'userSession';
  static fields = ['userName', 'accessToken', 'refreshToken', 'accessPolicy'];
}
