/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export interface SessionCookie {
  id: string;
  email: string;
  reset?: () => void;
}

export interface Credentials {
  emailAddress: string;
  password: string;
  deviceName: string;
}
