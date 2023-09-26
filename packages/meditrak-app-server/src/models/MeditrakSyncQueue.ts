/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  MeditrakSyncQueueModel as BaseMeditrakSyncQueueModel,
  MeditrakSyncQueueType as BaseMeditrakSyncQueueType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { MeditrakSyncQueue } from '@tupaia/types';

export interface MeditrakSyncQueueType
  extends MeditrakSyncQueue,
    Omit<BaseMeditrakSyncQueueType, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface MeditrakSyncQueueModel
  extends Model<BaseMeditrakSyncQueueModel, MeditrakSyncQueue, MeditrakSyncQueueType> {}
