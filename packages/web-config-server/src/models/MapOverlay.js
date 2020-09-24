/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class MapOverlay extends BaseModel {
  static databaseType = TYPES.MAP_OVERLAY;

  static fields = [
    'id',
    'name',
    'userGroup',
    'dataElementCode',
    'isDataRegional',
    'linkedMeasures',
    'presentationOptions',
    'measureBuilderConfig',
    'measureBuilder',
  ];
}
