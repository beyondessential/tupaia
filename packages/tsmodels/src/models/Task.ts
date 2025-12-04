import { TaskRecord as BaseTaskRecord, TaskModel as BaseTaskModel } from '@tupaia/database';
import { Task } from '@tupaia/types';
import { Model } from './types';

export interface TaskRecord extends Task, BaseTaskRecord {
  project_id?: string | null;
  data_time?: Date | null;
  timezone?: string | null;
}

export interface TaskModel extends Model<BaseTaskModel, Task, TaskRecord> {}
