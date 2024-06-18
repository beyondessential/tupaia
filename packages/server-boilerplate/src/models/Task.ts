/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { TaskRecord as BaseTaskRecord, TaskModel as BaseTaskModel } from '@tupaia/database';
import { Task } from '@tupaia/types';
import { Model } from './types';

export interface TaskRecord extends Task, BaseTaskRecord {}

export interface TaskModel extends Model<BaseTaskModel, Task, TaskRecord> {}
