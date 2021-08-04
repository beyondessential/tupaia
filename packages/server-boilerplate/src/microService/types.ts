/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityApi } from '../connections';

export type RequestContext = {
  microServices: {
    entityApi: EntityApi;
  };
};
