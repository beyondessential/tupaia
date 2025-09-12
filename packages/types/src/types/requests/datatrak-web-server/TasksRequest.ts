import { KeysToCamelCase } from '../../../utils/casing';
import { Country, Entity, Survey, Task, TaskStatus } from '../../models';

export type Params = Record<string, never>;

export interface TaskAssignee {
  id?: string | null;
  name?: string | null;
}

export type RawTaskResult = Omit<Task, 'created_at'> & {
  'entity.name': Entity['name'];
  'entity.code': Entity['code'];
  'entity.country_code': Country['code'];
  'survey.code': Survey['code'];
  'survey.name': Survey['name'];
  task_status: TaskStatus | 'overdue' | 'repeating';
  repeat_schedule?: Record<string, unknown> | null;
  task_due_date: Date | null;
  assignee_name?: string | null;
};

export type TaskResponse = KeysToCamelCase<
  Partial<Omit<Task, 'entity_id' | 'survey_id' | 'created_at' | 'repeat_schedule' | 'due_date'>>
> & {
  assignee?: TaskAssignee;
  taskStatus: TaskStatus | 'overdue' | 'repeating';
  survey: {
    name: Survey['name'];
    id: Survey['id'];
    code: Survey['code'];
  };
  entity: {
    name: Entity['name'];
    id: Entity['id'];
    code: Entity['code'];
    countryCode: string; // this is not undefined or null so use string explicitly here
    parentName?: Entity['name'];
  };
  repeatSchedule?: Record<string, unknown> | null;
  taskDueDate?: Date | null;
};

export type ResBody = {
  tasks: (TaskResponse & {
    commentsCount: number;
  })[];
  count: number;
  numberOfPages: number;
};
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
  pageSize?: number;
  sort?: string[];
  page?: number;
  filters?: Record<string, string>[];
}
