/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  MapOverlayGroupModel as BaseGroupModel,
  MapOverlayGroupType as BaseGroupType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

type MapOverlayGroupFields = Readonly<{
  id: string;
  name: string;
  code: string;
}>;

interface MapOverlayGroupType extends MapOverlayGroupFields, Omit<BaseGroupType, 'id'> {}

export interface MapOverlayGroupModel
  extends Model<BaseGroupModel, MapOverlayGroupFields, MapOverlayGroupType> {}
