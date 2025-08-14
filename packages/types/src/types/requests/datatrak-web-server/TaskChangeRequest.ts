import { Survey, Task } from '../../models';
import { RepeatSchedule } from '../../models-extra';

export type Params = Record<string, never>;
export type ResBody = {
  message: string;
};
export type ReqQuery = Record<string, never>;
export type ReqBody = Partial<Pick<Task, 'due_date'>> & {
  survey_code: Survey['code'];
  comment?: string;
  repeat_frequency?: RepeatSchedule['freq'];
  assignee?: {
    value: string;
    label: string;
  } | null;
};
