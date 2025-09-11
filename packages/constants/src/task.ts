const BASE_TASK_QUERY_FIELDS = [
  'assignee_id',
  'assignee_name',
  'entity.code',
  'entity.country_code',
  'entity.name',
  'entity_id',
  'id',
  'initial_request_id',
  'repeat_schedule',
  'survey.code',
  'survey.name',
  'survey_id',
  'task_due_date',
  'task_status',
];

export const TASKS_QUERY_FIELDS = BASE_TASK_QUERY_FIELDS;

export const SINGLE_TASK_QUERY_FIELDS = [...TASKS_QUERY_FIELDS, 'survey_response_id'];
