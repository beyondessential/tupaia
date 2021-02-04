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

const createAggregateAnalyticsMaterialView = async (db, periodType) => {
  await db.runSql(`
    CREATE MATERIALIZED VIEW aggregate_analytics_${periodType || 'all_time'} AS 
      SELECT analytics.entity_code, analytics.data_element_code, ${
        periodType ? `analytics.${periodType}_period AS "period", ` : ''
      }most_recent_answer_id, count(analytics.answer_id)
      FROM analytics
      JOIN 
      (SELECT entity_code, data_element_code, ${
        periodType ? `${periodType}_period, ` : ''
      }answer_id AS most_recent_answer_id, ROW_NUMBER() OVER (
                PARTITION BY
                  entity_code,
                  data_element_code${
                    periodType
                      ? `,
                    ${periodType}_period`
                      : ''
                  }
                  ORDER BY
                    date DESC
              ) AS duplicate_number
              FROM analytics) most_recent_answers
              ON most_recent_answers.duplicate_number = 1
              AND analytics.data_element_code = most_recent_answers.data_element_code
              AND analytics.entity_code = most_recent_answers.entity_code
              ${
                periodType
                  ? `AND analytics.${periodType}_period = most_recent_answers.${periodType}_period`
                  : ''
              }
      GROUP BY analytics.data_element_code, analytics.entity_code, ${
        periodType ? `analytics.${periodType}_period, ` : ''
      }most_recent_answer_id;`);
};

exports.up = async function (db) {
  await db.createTable('analytics', {
    columns: {
      id: { type: 'text', primaryKey: true },
      entity_code: { type: 'text', notNull: true },
      data_element_code: { type: 'text', notNull: true },
      answer_id: { type: 'text', notNull: true },
      day_period: { type: 'date', notNull: true },
      week_period: { type: 'date', notNull: true },
      month_period: { type: 'date', notNull: true },
      year_period: { type: 'date', notNull: true },
      date: { type: 'timestamptz', notNull: true },
    },
  });
  console.log('Created analytics table');

  await db.runSql(`
    INSERT INTO analytics (id, entity_code, data_element_code, day_period, week_period, month_period, year_period, answer_id, date) 
      (SELECT
        generate_object_id() as id,
        entity.code as entity_code,
        question.code as data_element_code,
        date_trunc('day', survey_response.submission_time) as "day_period",
        date_trunc('week', survey_response.submission_time) as "week_period",
        date_trunc('month', survey_response.submission_time) as "month_period",
        date_trunc('year', survey_response.submission_time) as "year_period",
        answer.id as answer_id,
        survey_response.submission_time as "date"
        FROM
          survey_response
        JOIN
          answer ON answer.survey_response_id = survey_response.id
        JOIN
          entity ON entity.id = survey_response.entity_id
        JOIN
          question ON question.id = answer.question_id
        JOIN 
          data_source ON data_source.code = question.code
          AND data_source.service_type = 'tupaia'
        ORDER BY survey_response.submission_time DESC);
      `);
  console.log('Added analytics table data');

  await db.runSql(`
    ALTER TABLE
      analytics
    ADD CONSTRAINT
      analytics_answer_id_fk FOREIGN KEY (answer_id)
        REFERENCES answer (id)
        ON UPDATE CASCADE ON DELETE CASCADE;
  `);

  // best index worked out by trying options and running timing tests, see
  // https://docs.google.com/spreadsheets/d/1KoewibyIxEJjpcjataeKi5svspPi41gbcG0LUtwIHZk/edit
  await db.addIndex('analytics', 'analytics_data_element_code_idx', ['data_element_code']);
  console.log('Added analytics table fk and index');

  await createAggregateAnalyticsMaterialView(db, 'day');
  console.log('Created day aggregate analytics`');
  await createAggregateAnalyticsMaterialView(db, 'week');
  console.log('Created week aggregate analytics`');
  await createAggregateAnalyticsMaterialView(db, 'month');
  console.log('Created month aggregate analytics`');
  await createAggregateAnalyticsMaterialView(db, 'year');
  console.log('Created year aggregate analytics`');
  await createAggregateAnalyticsMaterialView(db);
  console.log('Created all time aggregate analytics`');

  await db.addIndex('aggregate_analytics_day', 'aggregate_analytics_day_data_element_code_idx', [
    'data_element_code',
  ]);
  await db.addIndex('aggregate_analytics_week', 'aggregate_analytics_week_data_element_code_idx', [
    'data_element_code',
  ]);
  await db.addIndex(
    'aggregate_analytics_month',
    'aggregate_analytics_month_data_element_code_idx',
    ['data_element_code'],
  );
  await db.addIndex('aggregate_analytics_year', 'aggregate_analytics_year_data_element_code_idx', [
    'data_element_code',
  ]);
  await db.addIndex(
    'aggregate_analytics_all_time',
    'aggregate_analytics_all_time_data_element_code_idx',
    ['data_element_code'],
  );
  console.log('Added aggregate analytics indexes');

  return null;
};

exports.down = async function (db) {
  return db.runSql(`
  drop materialized view if exists aggregate_analytics_day;
  drop materialized view if exists aggregate_analytics_week;
  drop materialized view if exists aggregate_analytics_month;
  drop materialized view if exists aggregate_analytics_year;
  drop materialized view if exists aggregate_analytics_all_time;
  drop table if exists analytics;`);
};

exports._meta = {
  version: 1,
};
