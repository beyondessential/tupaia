import {
  TaskCommentRecord as BaseTaskCommentRecord,
  TaskCommentModel as BaseTaskCommentModel,
} from '@tupaia/database';
import { Task, TaskComment } from '../types/models';
import { Model } from './types';

export interface TaskCommentRecord extends TaskComment, BaseTaskCommentRecord {}

export interface TaskCommentModel extends Model<BaseTaskCommentModel, Task, TaskCommentRecord> {}
