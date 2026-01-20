import { sub } from 'date-fns';
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
      // set the time to the end of the day to get the full range of the day, and apply milliseconds to ensure the range is inclusive
      const end = new Date(value);
      // subtract 23 hours, 59 minutes, 59 seconds to get the start of the day. This is because the filters always send the end of the day, and we need a range to handle the values being saved in the database as unix timestamps based on the user's timezone.
      const start = sub(end, { hours: 23, minutes: 59, seconds: 59 });
      formattedFilters[id] = {
        comparator: 'BETWEEN',
        comparisonValue: [start.getTime(), end.getTime()],
      };
      continue;
    }

    if (EQUALITY_FILTERS.includes(id)) {
      formattedFilters[id] = value;
      continue;
    }

    if (id === FILTERS.REPEAT_SCHEDULE) {
      formattedFilters['repeat_schedule->freq'] = value;
      continue;
    }

    formattedFilters[id] = {
      comparator: 'ilike',
      comparisonValue: `${value}%`,
    };
  }

  return formattedFilters;
};
