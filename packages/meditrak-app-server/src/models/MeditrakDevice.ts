/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import {
  MeditrakDeviceModel as BaseMeditrakDeviceModel,
  MeditrakDeviceType as BaseMeditrakDeviceType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { MeditrakDevice } from '@tupaia/types';

export interface MeditrakDeviceType extends MeditrakDevice, Omit<BaseMeditrakDeviceType, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface MeditrakDeviceModel
  extends Model<BaseMeditrakDeviceModel, MeditrakDevice, MeditrakDeviceType> {}
