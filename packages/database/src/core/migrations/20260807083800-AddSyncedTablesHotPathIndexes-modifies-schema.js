'use strict';

// Companion to 20260807082500-AddHotPathPerformanceIndexes, split out because these tables
// (survey_response, task, task_comment) also exist in the DataTrak web browser database, so
// the indexes should be created there too.

exports.up = async function (db) {
  // DataTrak home screen queries (recent responses, recent surveys, rewards) all reduce to
  // "this user's responses, newest first". The composite supersedes the single-column
  // user_id index (present in both the server schema and the DataTrak web initial schema),
  // so drop it.
  await db.runSql(`
    CREATE INDEX IF NOT EXISTS survey_response_user_id_data_time_idx
      ON survey_response (user_id, data_time DESC);
    DROP INDEX IF EXISTS survey_response_user_id_idx;
  `);

  // DataTrak tasks page defaults to assignee + open statuses ordered by due_date, and
  // taskMetrics counts open/overdue tasks. The per-row comment count filters (task_id, type).
  await db.runSql(`
    CREATE INDEX IF NOT EXISTS task_assignee_id_status_due_date_idx
      ON task (assignee_id, status, due_date);
    CREATE INDEX IF NOT EXISTS task_comment_task_id_type_idx
      ON task_comment (task_id, type);
  `);

  // 20240806015831-AddTaskInitialRequestId (and the DataTrak web initial schema, which copied
  // it) indexed survey_response_id (already covered by task_survey_response_id_idx) instead of
  // the new initial_request_id column. Drop the duplicate and index the intended column. On
  // the server, the FK constraint of the same name is unaffected (DROP INDEX only targets the
  // relation).
  await db.runSql(`
    DROP INDEX IF EXISTS task_initial_request_id_fk;
    CREATE INDEX IF NOT EXISTS task_initial_request_id_idx ON task (initial_request_id);
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DROP INDEX IF EXISTS survey_response_user_id_data_time_idx;
    CREATE INDEX IF NOT EXISTS survey_response_user_id_idx ON survey_response (user_id);

    DROP INDEX IF EXISTS task_assignee_id_status_due_date_idx;
    DROP INDEX IF EXISTS task_comment_task_id_type_idx;

    DROP INDEX IF EXISTS task_initial_request_id_idx;
    CREATE INDEX IF NOT EXISTS task_initial_request_id_fk ON task USING btree (survey_response_id);
  `);
};

exports._meta = {
  version: 1,
  targets: ['browser', 'server'],
};
