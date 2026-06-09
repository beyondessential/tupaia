import type { TaskRecord as BaseTaskRecord, TaskModel as BaseTaskModel } from '@tupaia/database';
import type { Task, UserAccount } from '@tupaia/types';
import type { Model } from './types';

export interface TaskRecord extends Task, BaseTaskRecord {
  project_id?: string | null;
  data_time?: Date | null;
  timezone?: string | null;
}

// @ts-expect-error
// BaseTaskModel’s `create` and `updateById` instance method overrides change their signatures
export interface TaskModel extends Model<BaseTaskModel, Task, TaskRecord> {
  create(fields: Partial<Task>, createdBy?: UserAccount['id']): Promise<TaskRecord>;
  updateById(
    id: Task['id'],
    updatedFields: Partial<Task>,
    updatedBy: UserAccount['id'],
  ): Promise<TaskRecord>;
}
