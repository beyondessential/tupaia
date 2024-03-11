/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { OneTimeLoginModel, OneTimeLoginRecord as BaseOneTimeLoginRecord } from '@tupaia/database';
import { Model, ServerBoilerplateModelRegistry } from '@tupaia/server-boilerplate';
import { OneTimeLogin } from '@tupaia/types';
import { OptionModel } from '@tupaia/database';

export type OneTimeLoginRecord = BaseOneTimeLoginRecord & OneTimeLogin;

export interface DatatrakWebServerModelRegistry extends ServerBoilerplateModelRegistry {
  readonly oneTimeLogin: Model<OneTimeLoginModel, OneTimeLogin, OneTimeLoginRecord>;
  readonly option: OptionModel;
}
