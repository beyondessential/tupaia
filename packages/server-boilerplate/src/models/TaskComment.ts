/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import {
  TaskCommentRecord as BaseTaskCommentRecord,
  TaskCommentModel as BaseTaskCommentModel,
} from '@tupaia/database';
import { Task, TaskComment } from '@tupaia/types';
import { Model } from './types';

export interface TaskCommentRecord extends TaskComment, BaseTaskCommentRecord {}

export interface TaskCommentModel extends Model<BaseTaskCommentModel, Task, TaskCommentRecord> {}
