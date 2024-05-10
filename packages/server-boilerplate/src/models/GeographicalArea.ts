/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  GeographicalAreaModel as BaseGeographicalAreaModel,
  GeographicalAreaRecord as BaseGeographicalAreaRecord,
} from '@tupaia/database';
import { GeographicalArea } from '@tupaia/types';
import { Model } from './types';

export interface GeographicalAreaRecord extends GeographicalArea, BaseGeographicalAreaRecord {}

export interface GeographicalAreaModel
  extends Model<BaseGeographicalAreaModel, GeographicalArea, GeographicalAreaRecord> {}
