/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { ServerBoilerplateModelRegistry } from '@tupaia/server-boilerplate';

type Models =
  | 'user'
  | 'entity'
  | 'dashboard'
  | 'dashboardItem'
  | 'mapOverlayGroup'
  | 'dashboardMailingListEntry'
  | 'dashboardRelation'
  | 'mapOverlayGroupRelation';

export interface TupaiaWebServerModelRegistry
  extends Pick<ServerBoilerplateModelRegistry, Models> {}
