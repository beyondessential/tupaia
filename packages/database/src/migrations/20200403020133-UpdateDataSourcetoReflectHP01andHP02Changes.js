'use strict';

import { generateId } from '../utilities/generateId';

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
  // These two ids are for new HP02 questions that require specific dataElementCode configuration in the data_source table
  const HP35nId = generateId();
  const HP36nId = generateId();

  // The below array stores the remaining new HP02 question codes
  const HP02QuestionCodesWithNoSpecificConfiguration = [
    'HP31n',
    'HP32n',
    'HP33n',
    'HP34n',
    'HP30n',
    'HP45n',
    'HP65n',
    'HP75n',
    'HP115n',
    'HP135n',
    'HP155n',
    'HP165n',
    'HP175n',
    'HP195n',
    'HP_KnownYes1n',
  ];

  // The below array stores the new HP01 question codes
  const HP01QuestionCodesWithNoSpecificConfiguration = [
    'HP12n',
    'HP13n',
    'HP13a',
    'HP13b',
    'HP14n',
    'HP15n',
    'HP15a',
    'HP15b',
    'HP22n',
    'HP23n',
    'HP23a',
    'HP23b',
    'HP24n',
    'HP25n',
    'HP25a',
    'HP25b',
  ];

  // The below array contains the codes for all the questions that have been deleted from HP01 and HP02
  const removedHP01andHP02QuestionCodes = [
    'HP191',
    'HP96',
    'HP36',
    'HP_KnownNo10',
    'HP_KnownYes7',
    'HP165',
    'HP45',
    'HP138',
    'HP_KnownNo3',
    'HP48',
    'HP120',
    'HP159',
    'HP168',
    'HP184',
    'HP84',
    'HP57',
    'HP187',
    'HP115',
    'HP102',
    'HP167',
    'HP75',
    'HP173',
    'HP81',
    'HP68',
    'HP182',
    'HP136',
    'HP145',
    'HP110',
    'HP202',
    'HP80',
    'HP122',
    'HP174',
    'HP175',
    'HP89',
    'HP124',
    'HP59',
    'HP_KnownYes2',
    'HP141',
    'HP193',
    'HP_KnownNo4',
    'HP106',
    'HP92',
    'HP_KnownYes3',
    'HP134',
    'HP125',
    'HP67',
    'HP192',
    'HP142',
    'HP69',
    'HP49',
    'HP162',
    'HP103',
    'HP46',
    'HP65',
    'HP171',
    'HP117',
    'HP52',
    'HP88',
    'HP186',
    'HP_KnownYes8',
    'HP188',
    'HP64',
    'HP129',
    'HP201',
    'HP_KnownNo6',
    'HP108',
    'HP_KnownNo5',
    'HP55',
    'HP93',
    'HP130',
    'HP154',
    'HP_KnownNo7',
    'HP79',
    'HP101',
    'HP176',
    'HP42',
    'HP_KnownYes5',
    'HP60',
    'HP164',
    'HP62',
    'HP70',
    'HP39',
    'HP113',
    'HP40',
    'HP50',
    'HP54',
    'HP109',
    'HP87',
    'HP181',
    'HP199',
    'HP116',
    'HP_KnownYes4',
    'HP_KnownNo2',
    'HP169',
    'HP196',
    'HP_KnownNo9',
    'HP35',
    'HP178',
    'HP107',
    'HP114',
    'HP126',
    'HP121',
    'HP139',
    'HP198',
    'HP185',
    'HP51',
    'HP41',
    'HP204',
    'HP112',
    'HP118',
    'HP163',
    'HP151',
    'HP95',
    'HP137',
    'HP85',
    'HP143',
    'HP131',
    'HP152',
    'HP127',
    'HP82',
    'HP135',
    'HP53',
    'HP128',
    'HP94',
    'HP77',
    'HP98',
    'HP179',
    'HP105',
    'HP_KnownYes6',
    'HP157',
    'HP155',
    'HP_KnownYes1',
    'HP76',
    'HP132',
    'HP86',
    'HP71',
    'HP147',
    'HP38',
    'HP119',
    'HP161',
    'HP144',
    'HP58',
    'HP148',
    'HP37',
    'HP200',
    'HP43',
    'HP44',
    'HP83',
    'HP156',
    'HP63',
    'HP33',
    'HP194',
    'HP97',
    'HP100',
    'HP172',
    'HP160',
    'HP190',
    'HP183',
    'HP_KnownYes9',
    'HP197',
    'HP153',
    'HP111',
    'HP34',
    'HP140',
    'HP104',
    'HP180',
    'HP195',
    'HP91',
    'HP133',
    'HP146',
    'HP170',
    'HP99',
    'HP72',
    'HP158',
    'HP61',
    'HP90',
    'HP203',
    'HP_KnownNo1',
    'HP32',
    'HP73',
    'HP66',
    'HP189',
    'HP177',
    'HP149',
    'HP_KnownYes10',
    'HP74',
    'HP56',
    'HP47',
    'HP166',
    'HP30',
    'HP78',
    'HP31',
    'HP_KnownNo8',
    'HP150',
    'HP123',
  ];

  // This inserts the two new questions with specific dataElementCode configurations into the data_source and data_element_data_group tables
  await db.runSql(`
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
  );

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP35nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';

  INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
  SELECT '${generateId()}', '${HP36nId}', id
  FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';
  `);

  // This inserts the remaining new HP02 questions into the data_source and data_element_data_group tables
  await Promise.all(
    HP02QuestionCodesWithNoSpecificConfiguration.map(async function (questionCode) {
      const dataSourceId = generateId();
      await db.runSql(`
        INSERT INTO "data_source" ("id", "code", "type", "service_type", "config")
         VALUES 
          (
            '${dataSourceId}',
            '${questionCode}',
            'dataElement',
            'dhis',
            '{"isDataRegional": false}'
          );

        INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
        SELECT '${generateId()}', '${dataSourceId}', id
        FROM data_source WHERE type = 'dataGroup' AND code = 'HP02';       
      `);
    }),
  );

  // This inserts the new HP01 questions into the data_source and data_element_data_group tables
  await Promise.all(
    HP01QuestionCodesWithNoSpecificConfiguration.map(async function (questionCode) {
      const dataSourceId = generateId();
      await db.runSql(`
      INSERT INTO "data_source" ("id", "code", "type", "service_type", "config")
        VALUES 
         (
           '${dataSourceId}',
           '${questionCode}',
           'dataElement',
           'dhis',
           '{"isDataRegional": false}'
         );
      
      INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
      SELECT '${generateId()}', '${dataSourceId}', id
      FROM data_source WHERE type = 'dataGroup' AND code = 'HP01';
    `);
    }),
  );

  // This deletes all the questions that have been removed from the HP01 and HP02 surveys
  await Promise.all(
    removedHP01andHP02QuestionCodes.map(async function (questionCode) {
      await db.runSql(`
     DELETE FROM "data_source" where "code" = '${questionCode}' AND "type" = 'dataElement';
    `);
    }),
  );

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
