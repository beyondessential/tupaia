/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import {
  MapOverlayGroupRelationModel as BaseRelationModel,
  MapOverlayGroupRelationRecord as BaseRelationType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

type MapOverlayGroupRelationFields = Readonly<{
  id: string;
  map_overlay_group_id: string;
  child_id: string;
  child_type: 'mapOverlay' | 'mapOverlayGroup';
  sort_order: number | null;
}>;

interface MapOverlayGroupRelationRecord
  extends MapOverlayGroupRelationFields,
    Omit<BaseRelationType, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface MapOverlayGroupRelationModel
  extends Model<BaseRelationModel, MapOverlayGroupRelationFields, MapOverlayGroupRelationRecord> {
  findParentRelationTree: (childIds: string[]) => Promise<MapOverlayGroupRelationRecord[]>;
}
