/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { ServerBoilerplateModelRegistry } from '@tupaia/server-boilerplate';

type Models =
  | 'database'
  | 'user'
  | 'entity'
  | 'country'
  | 'feedItem'
  | 'survey'
  | 'surveyResponse'
  | 'oneTimeLogin'
  | 'option';

export type DatatrakWebServerModelRegistry = Pick<ServerBoilerplateModelRegistry, Models>;
