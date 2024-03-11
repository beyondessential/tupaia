/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import {
  EntityModel,
  EntityRecord as BaseEntityRecord,
  SurveyModel,
  OneTimeLoginModel,
  OneTimeLoginRecord as BaseOneTimeLoginRecord,
} from '@tupaia/database';
import { Model, ServerBoilerplateModelRegistry } from '@tupaia/server-boilerplate';
import { Entity, OneTimeLogin } from '@tupaia/types';
import { SurveyResponseModel } from './models';
import { OptionModel } from '@tupaia/database';

export type EntityRecord = BaseEntityRecord & Entity;
export type OneTimeLoginRecord = BaseOneTimeLoginRecord & OneTimeLogin;

export interface DatatrakWebServerModelRegistry extends ServerBoilerplateModelRegistry {
  readonly entity: Model<EntityModel, Entity, EntityRecord>;
  readonly surveyResponse: SurveyResponseModel;
  readonly survey: SurveyModel;
  readonly oneTimeLogin: Model<OneTimeLoginModel, OneTimeLogin, OneTimeLoginRecord>;
  readonly option: OptionModel;
}
