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

const countFacilities = async db => {
  const uniqueValues = {};
  const { rows } = await db.runSql(`
    select e.code, a.text, sr.submission_time, sr.end_time
    from answer a
    inner join survey_response sr on a.survey_response_id = sr.id
    inner join question q on a.question_id = q.id
    inner join entity e on e.id = sr.entity_id
    where q.code in('RHS2UNFPA240')
    and e.country_code = 'FJ'
    order by  e.name, sr.submission_time, sr.end_time desc;`);

  rows.forEach(r => {
    if (!(r.code in uniqueValues)) uniqueValues[r.code] = r.text;
  });

  const facilitiesOfferingService = [];
  Object.keys(uniqueValues).forEach(k => {
    if (uniqueValues[k] === 'Yes') facilitiesOfferingService.push(k);
  });

  console.log(facilitiesOfferingService);
};

exports.up = function (db) {
  return countFacilities(db);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
