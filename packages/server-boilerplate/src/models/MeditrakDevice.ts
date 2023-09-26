/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  MeditrakDeviceModel as BaseMeditrakDeviceModel,
  MeditrakDeviceRecord as BaseMeditrakDeviceRecord,
} from '@tupaia/database';
import { MeditrakDevice } from '@tupaia/types';
import { Model } from './types';

export interface MeditrakDeviceRecord extends MeditrakDevice, BaseMeditrakDeviceRecord {}

export interface MeditrakDeviceModel
  extends Model<BaseMeditrakDeviceModel, MeditrakDevice, MeditrakDeviceRecord> {}
