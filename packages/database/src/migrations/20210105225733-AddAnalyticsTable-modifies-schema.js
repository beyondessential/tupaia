'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.createTable('analytics', {
    columns: {
      id: { type: 'text', primaryKey: true },
      survey_response_id: { type: 'text', notNull: true },
      type: { type: 'text', notNull: true },
      entity_name: { type: 'text', notNull: true },
      entity_code: { type: 'text', notNull: true },
      data_element_code: { type: 'text', notNull: true },
      value: { type: 'text', notNull: true },
      date: { type: 'timestamptz', notNull: true },
    },
  });

  await db.runSql(`
    WITH analytics_cte(id, survey_response_id, type, entity_name, entity_code, data_element_code, value, date, duplicate_number)
    AS (
      SELECT
        generate_object_id(),
        survey_response.id,
        question.type,
        entity.name,
        entity.code,
        question.code,
        answer.text,
        survey_response.submission_time,
        ROW_NUMBER() OVER (
          PARTITION BY
            entity.code,
            question.code,
            date_part('year', submission_time),
                date_part('month', submission_time),
                date_part('day', submission_time)
            ORDER BY
              survey_response.end_time DESC
        ) AS duplicate_number
        FROM
          survey_response
        JOIN
          answer ON answer.survey_response_id = survey_response.id
        JOIN
          entity ON entity.id = survey_response.entity_id
        JOIN
          question ON question.id = answer.question_id
        JOIN
          survey ON survey.id = survey_response.survey_id
    )
    INSERT INTO analytics (id, survey_response_id, type, entity_name, entity_code, data_element_code, value, date)
    SELECT id, survey_response_id, type, entity_name, entity_code, data_element_code, value, date
    FROM analytics_cte
    WHERE duplicate_number = 1;
  `);

  // best combination of indexes worked out by adding heaps and looking at the "explain analyze" for
  // internal data fetching queries
  await db.addIndex('analytics', 'analytics_entity_element_date_key', [
    'entity_code',
    'data_element_code',
    'date',
  ]);
  await db.addIndex('analytics', 'analytics_element_entity_date_key', [
    'data_element_code',
    'entity_code',
    'date',
  ]);

  return null;
};

exports.down = async function (db) {
  return db.dropTable('analytics');
};

exports._meta = {
  version: 1,
};
