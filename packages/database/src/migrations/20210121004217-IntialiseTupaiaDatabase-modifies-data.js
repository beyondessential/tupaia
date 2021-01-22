'use strict';

import { insertObject, generateId, codeToId } from '../utilities';

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

const tupaiaAdminPanelUserGroup = {
  id: generateId(),
  name: 'Tupaia Admin Panel',
};

const adminUserGroup = {
  id: generateId(),
  name: 'Admin',
};

const donorUserGroup = {
  id: generateId(),
  name: 'Donor',
  parent_id: adminUserGroup.id,
};

const publicUserGroup = {
  id: generateId(),
  name: 'Public',
  parent_id: donorUserGroup.id,
};

const worldEntity = {
  id: generateId(),
  code: 'World',
  name: 'World',
  type: 'world',
  attributes: '{}',
};

const exploreEntity = {
  id: generateId(),
  code: 'explore',
  name: 'Explore',
  type: 'project',
  bounds: 'POLYGON ((110 6.5, -155.5 6.5, -155.5 -40, 149 -40, 110 6.5))',
  attributes: '{}',
};

const demoLandEntity = {
  id: generateId(),
  code: 'DL',
  name: 'Demo Land',
  type: 'country',
  region:
    'MULTIPOLYGON (((157.5816 -22.113, 157.5726 -22.0992, 157.5068 -22.0975, 157.4842 -22.0821, 157.5103 -21.9447, 157.5108 -21.8357, 157.4968 -21.8195, 157.4184 -21.8076, 157.3904 -21.8309, 157.2893 -21.8429, 157.2217 -21.8844, 157.1874 -21.9335, 157.164 -22.0664, 157.228 -22.1587, 157.3309 -22.1639, 157.3516 -22.1829, 157.4157 -22.1717, 157.4689 -22.119, 157.5816 -22.113)))',
  country_code: 'DL',
  bounds:
    'POLYGON ((157.1594 -22.1829, 157.1594 -21.8076, 157.5816 -21.8076, 157.5816 -22.1829, 157.1594 -22.1829))',
  attributes: '{}',
};

const exploreEntityHierarchy = {
  id: generateId(),
  name: 'explore',
};

const exploreToDemoLandEntityRelation = {
  id: generateId(),
  parent_id: exploreEntity.id,
  child_id: demoLandEntity.id,
  entity_hierarchy_id: exploreEntityHierarchy.id,
};

const exploreProject = {
  id: generateId(),
  code: 'explore',
  user_groups: '{Public}',
  entity_id: exploreEntity.id,
  entity_hierarchy_id: exploreEntityHierarchy.id,
};

exports.up = async function (db) {
  //Permission groups
  await insertObject(db, 'permission_group', tupaiaAdminPanelUserGroup);
  await insertObject(db, 'permission_group', adminUserGroup);
  await insertObject(db, 'permission_group', donorUserGroup);
  await insertObject(db, 'permission_group', publicUserGroup);

  //Explore project/entity
  await insertObject(db, 'entity', worldEntity);
  await insertObject(db, 'entity', exploreEntity);
  await insertObject(db, 'entity', demoLandEntity);
  await insertObject(db, 'entity_hierarchy', exploreEntityHierarchy);
  await insertObject(db, 'entity_relation', exploreToDemoLandEntityRelation);
  await insertObject(db, 'project', exploreProject);

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
