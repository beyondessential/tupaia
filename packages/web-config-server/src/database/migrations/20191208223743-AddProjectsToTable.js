'use strict';

import { insertMultipleObjects, arrayToDbString } from '../migrationUtilities';
import { generateId } from '@tupaia/database';

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

const overlays = [
  {
    id: generateId(),
    code: 'explore',
    user_groups: `{"Public"}`,
    entity_ids: `{"5d3f8844a72aa231bf71977f"}`,
    name: 'General',
  },
  {
    id: generateId(),
    code: 'disaster',
    user_groups: `{"Public"}`,
    entity_ids: `{"5d3f8844a72aa231bf71977f"}`,
    name: 'Disaster Response',
    description: 'Active disasters across the Pacific and country resources.',
    sort_order: 0,
    dashboard_group_name: 'Disaster Response',
    default_measure: '194,192',
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/disaster_logo.jpg',
  },
  {
    id: generateId(),
    code: 'unfpa',
    user_groups: `{"UNFPA"}`,
    entity_ids: `{"5df1b88c61f76a485cd1ca09", "5df1b88161f76a485c175339"}`,
    name: 'UNFPA',
    description: 'Regional information on RH commodities, service provision and utilisation',
    sort_order: 1,
    dashboard_group_name: 'UNFPA',
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/unfpa_logo.svg',
  },
  {
    id: generateId(),
    code: 'wish',
    user_groups: `{"Fiji Data Collection"}`,
    entity_ids: `{"5d51f501f013d6320f3cf633"}`,
    name: 'WISH Fiji',
    description: 'Predictive environmental health mapping for water borne disease',
    sort_order: 3,
    dashboard_group_name: 'Fiji Data Downloads',
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/wish_logo.png',
  },
  {
    id: generateId(),
    code: 'strive',
    user_groups: `{"Strive PNG", "Strive PNG Laboratory"}`,
    entity_ids: `{"5d3f8844f327a531bfd8ad77"}`,
    name: 'STRIVE PNG',
    description: 'Malaria resistance and vector surveillance',
    sort_order: 2,
    dashboard_group_name: 'Strive PNG',
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/strive_logo.png',
  },
  {
    id: generateId(),
    code: 'imms',
    user_groups: `{"EPI"}`,
    entity_ids: `{"5d3f88442c423131bf2436a7", "5d3f8844a078f431bf0bc177"}`,
    name: 'Immunization Module',
    description: 'Vaccine availability, fridge temperatures, EPI program information',
    sort_order: 4,
    dashboard_group_name: 'Immunisation',
    default_measure: '207',
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/imms_logo.png',
  },
  {
    id: generateId(),
    code: 'fanafana',
    user_groups: `{
      "Tonga Communicable Diseases",
      "Tonga Public Health Heads",
      "Tonga Reproductive Health",
      "Tonga Community Health",
      "Tonga Health Promotion Unit"
    }`,
    entity_ids: `{"5d3f884471bb2e31bfacae23"}`,
    name: 'Fanafana Ola',
    description: 'HIS for Tonga public health, integrating DHIS2 and mSupply',
    sort_order: 5,
    default_measure: 'TONGA_NUMBER_OF_HOUSEHOLDS',
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/fanafanaola_project.jpg',
  },
];

exports.up = async function(db) {
  await db.runSql(`
    DELETE FROM "project" WHERE "code" IN ('explore', 'disaster');

    ALTER TABLE "project" DROP COLUMN "user_group";
    ALTER TABLE "project" ADD COLUMN "user_groups" text[];
  `);

  return insertMultipleObjects(db, 'project', overlays);
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE "project" DROP COLUMN "user_groups";
    ALTER TABLE "project" ADD COLUMN "user_group" text;

    DELETE FROM "project"
    WHERE "code" IN (${arrayToDbString(overlays.map(o => o.code))});
  `);
};

exports._meta = {
  version: 1,
};
