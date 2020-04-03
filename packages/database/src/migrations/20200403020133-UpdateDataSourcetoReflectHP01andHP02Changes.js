'use strict';

import { generateId } from '../utilities/generateId';

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

exports.up = function(db) {
  const HP35nId  = generateId();
  const HP36nId = generateId();
  const HP31nId = generateId();
  const HP32nId = generateId();
  const HP33nId = generateId();
  const HP34nId = generateId();
  const HP30nId = generateId();
  const HP45nId = generateId();
  const HP65nId = generateId();
  const HP75nId = generateId();
  const HP115nId = generateId();
  const HP135nId = generateId();
  const HP155nId = generateId();
  const HP165nId = generateId();
  const HP175nId = generateId();
  const HP195nId = generateId();
  const HP_KnownYes1nId = generateId();
  const HP12nId = generateId();
  const HP13nId = generateId();
  const HP13aId = generateId();
  const HP13bId = generateId();
  const HP14nId = generateId();
  const HP15nId = generateId();
  const HP15aId = generateId();
  const HP15bId = generateId();
  const HP22nId = generateId();
  const HP23nId = generateId();
  const HP23aId = generateId();
  const HP23bId = generateId();
  const HP24nId = generateId();
  const HP25nId = generateId();
  const HP25aId = generateId();
  const HP25bId = generateId();

  return db.runSql(`
  INSERT INTO "data_source" ("id", "code", "type", "service_type", "config")
  VALUES 
  (
    '${HP35nId}',
    'HP35n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false, "dataElementCode": "Age"}'
  ),
  (
    '${HP36nId}',
    'HP36n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false, "dataElementCode": "Gender"}'
  ),
  (
    '${HP31nId}',
    'HP31n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP32nId}',
    'HP32n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP33nId}',
    'HP33n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP34nId}',
    'HP34n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP30nId}',
    'HP30n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP45nId}',
    'HP45n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP65nId}',
    'HP65n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP75nId}',
    'HP75n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP115nId}',
    'HP115n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP135nId}',
    'HP135n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP155nId}',
    'HP155n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP165nId}',
    'HP165n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP175nId}',
    'HP175n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP195nId}',
    'HP195n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP_KnownYes1nId}',
    'HP_KnownYes1n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP12nId}',
    'HP12n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP13nId}',
    'HP13n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP13aId}',
    'HP13a',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP13bId}',
    'HP13b',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP14nId}',
    'HP14n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP15nId}',
    'HP15n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP15aId}',
    'HP15a',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP15bId}',
    'HP15b',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP22nId}',
    'HP22n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP23nId}',
    'HP23n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP23aId}',
    'HP23a',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP23bId}',
    'HP23b',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP24nId}',
    'HP24n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP25nId}',
    'HP25n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP25aId}',
    'HP25a',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${HP25bId}',
    'HP25b',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  );

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP35nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP36nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP31nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP32nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP33nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP34nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP30nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP45nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP65nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP75nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP115nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP135nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP155nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP165nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP175nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP195nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP_KnownYes1nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP12nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP13nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP13aId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP13bId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP14nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP15nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP15aId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP15bId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP22nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP23nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP23aId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP23bId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP24nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP25nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP25aId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP25bId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';
`)
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
