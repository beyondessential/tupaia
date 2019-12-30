'use strict';
var async = require('async');

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  // Note: This cannot run as relationships already exist.
  /*
  async.series([
    db.addForeignKey.bind(db, 'answer', 'question', 'answer_question_id_fkey',
      {
        'question_id': 'id'
      },
      {
        onUpdate: 'NO_ACTION',
        onDelete: 'NO_ACTION'
      }),
    db.addForeignKey.bind(db, 'answer', 'survey_response', 'answer_survey_response_id_fkey',
      {
        'survey_response_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    db.addForeignKey.bind(db, 'api_request_log', 'user_account', 'api_request_log_user_id_fkey',
      {
        'user_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'NO_ACTION'
      }),
    db.addForeignKey.bind(db, 'clinic', 'country', 'clinic_country_id_fkey',
      {
        'country_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }),
    db.addForeignKey.bind(db, 'clinic', 'geographical_area', 'clinic_geographical_area_id_fkey',
      {
        'geographical_area_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }),
    db.addForeignKey.bind(db, 'error_log', 'api_request_log', 'error_log_api_request_log_id_fkey',
      {
        'api_request_log_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    db.addForeignKey.bind(db, 'geographical_area', 'country', 'geographical_area_country_id_fkey',
      {
        'country_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    db.addForeignKey.bind(db, 'geographical_area', 'geographical_area', 'geographical_area_parent_id_fkey',
      {
        'parent_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    db.addForeignKey.bind(db, 'permission_group', 'permission_group', 'permission_group_parent_id_fkey',
      {
        'parent_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }),
    db.addForeignKey.bind(db, 'refresh_token', 'user_account', 'refresh_token_user_id_fkey',
      {
        'user_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    db.addForeignKey.bind(db, 'survey', 'permission_group', 'survey_permission_group_id_fkey',
      {
        'permission_group_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }),
    db.addForeignKey.bind(db, 'survey', 'survey_group', 'survey_survey_group_id_fkey',
      {
        'survey_group_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'SET_NULL'
      }),
    db.addForeignKey.bind(db, 'survey_response', 'clinic', 'survey_response_clinic_id_fkey',
      {
        'clinic_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }),
    db.addForeignKey.bind(db, 'survey_response', 'survey', 'survey_response_survey_id_fkey',
      {
        'survey_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }),
    db.addForeignKey.bind(db, 'survey_response', 'user_account', 'survey_response_user_id_fkey',
      {
        'user_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }),
    db.addForeignKey.bind(db, 'survey_screen', 'survey', 'survey_screen_survey_id_fkey',
      {
        'survey_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    db.addForeignKey.bind(db, 'survey_screen_component', 'question', 'survey_screen_component_question_id_fkey',
      {
        'question_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }),
    db.addForeignKey.bind(db, 'survey_screen_component', 'survey_screen', 'survey_screen_component_screen_id_fkey',
      {
        'screen_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    db.addForeignKey.bind(db, 'user_country_permission', 'user_account', 'user_country_permission_country_id_fkey',
      {
        'country_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    db.addForeignKey.bind(db, 'user_country_permission', 'permission_group', 'user_country_permission_permission_group_id_fkey',
      {
        'permission_group_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    db.addForeignKey.bind(db, 'user_country_permission', 'user_account', 'user_country_permission_user_id_fkey',
      {
        'user_id': 'id'
      },
      {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      })
  ], callback);
  */

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
