import { endOfDay, startOfDay } from 'date-fns';
import { isEmpty } from '../typeGuards';

export interface FormattedFilters {
  [key: string]:
    | string
    | {
        comparator: string;
        comparisonValue: unknown;
      };
}

const FILTERS = {
  DUE_DATE: 'due_date',
  REPEAT_SCHEDULE: 'repeat_schedule',
  ASSIGNEE_ID: 'assignee_id',
  SURVEY_PROJECT_ID: 'survey.project_id',
  TASK_STATUS: 'task_status',
};
const EQUALITY_FILTERS = [FILTERS.ASSIGNEE_ID, FILTERS.SURVEY_PROJECT_ID, FILTERS.TASK_STATUS];

export const formatFilters = (filters: Record<string, string>[]) => {
  const formattedFilters: FormattedFilters = {};

  for (const { id, value } of filters) {
    if (isEmpty(value)) {
      continue;
    }

    if (id === FILTERS.DUE_DATE) {
      const date = new Date(value);
      const start = startOfDay(date);
      const end = endOfDay(date);
      formattedFilters[id] = {
        comparator: 'BETWEEN',
        comparisonValue: [start.getTime(), end.getTime()],
      };
      continue;
    }

    if (id === FILTERS.REPEAT_SCHEDULE) {
      formattedFilters['repeat_schedule->freq'] = value;
      continue;
    }

    if (EQUALITY_FILTERS.includes(id)) {
      formattedFilters[id] = value;
      continue;
    }

    formattedFilters[id] = {
      comparator: 'ilike',
      comparisonValue: `${value}%`,
    };
  }

  return formattedFilters;
};
