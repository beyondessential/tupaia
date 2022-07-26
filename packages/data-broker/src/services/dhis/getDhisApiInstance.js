/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import { getDhisConfig, createClassExtendingProxy } from '@tupaia/utils';
import { DhisInputSchemeResolvingApiProxy } from './translators';

const instances = {};

export const getDhisApiInstance = (options, models) => {
  const { serverName, serverUrl, serverReadOnly } = getDhisConfig(options);
  if (!instances[serverName]) {
    // Having a subclass of DhisApi causes some sort of circular dependency issue here, so we
    // have to extend it using an object proxy, which intercepts overridden method calls and passes
    // the rest through.
    const api = new DhisApi(serverName, serverUrl, serverReadOnly);
    const apiExtension = new DhisInputSchemeResolvingApiProxy(models, api);
    instances[serverName] = createClassExtendingProxy(api, apiExtension);
  }
  return instances[serverName];
};
