/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import * as measureBuilders from '/apiV1/measureBuilders';

const DEFAULT_NAME = 'valueForOrgGroup';

export const getMeasureBuilder = name => measureBuilders[name] || measureBuilders[DEFAULT_NAME];
