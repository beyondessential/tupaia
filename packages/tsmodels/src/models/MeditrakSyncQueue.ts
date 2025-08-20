import {
  MeditrakSyncQueueModel as BaseMeditrakSyncQueueModel,
  MeditrakSyncQueueRecord as BaseMeditrakSyncQueueRecord,
} from '@tupaia/database';
import { MeditrakSyncQueue } from '../types/models';
import { Model } from './types';

export interface MeditrakSyncQueueRecord extends MeditrakSyncQueue, BaseMeditrakSyncQueueRecord {}

export interface MeditrakSyncQueueModel
  extends Model<BaseMeditrakSyncQueueModel, MeditrakSyncQueue, MeditrakSyncQueueRecord> {}
