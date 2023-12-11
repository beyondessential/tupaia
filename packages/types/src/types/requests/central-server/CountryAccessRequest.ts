/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export interface CountryAccessResponse {
  id: string;
  name: string;
  hasAccess: boolean;
  accessRequests: string[];
}
