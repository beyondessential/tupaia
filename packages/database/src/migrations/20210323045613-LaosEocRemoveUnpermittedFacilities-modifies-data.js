'use strict';

import { arrayToDbString } from '../utilities';

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

const facilityIds = [
  'kgOEwygnRjE',
  'nVK4um8KmwG',
  'BxrxPkvmBkI',
  'GJwgCgpcSMs',
  'SaF9mpwInVF',
  'niZRRhMU6BB',
  'PnOH7yXRfeq',
];

const fetchCodes = (db, ids) =>
  db.runSql(`
    select "entity_code" as codes from "data_service_entity" 
    where "config" ->> 'dhis_id' in (${arrayToDbString(ids)});
  `);

exports.up = async function (db) {
  const codes = (await fetchCodes(db, facilityIds)).rows.map(r => r.codes);

  return db.runSql(`
    delete from "clinic" where code in (${arrayToDbString(codes)}); 
    delete from "data_service_entity" where "entity_code" in (${arrayToDbString(codes)}); 
    delete from "entity" where "code" in (${arrayToDbString(codes)}); 
  `);
};

exports.down = function (db) {
  // For dev purposes only when we restore we will use admin import
  // file on https://github.com/beyondessential/tupaia-backlog/issues/2535#issuecomment-804615828
  return db.runSql(`
    INSERT INTO public.data_service_entity
    (id, entity_code, config)
    VALUES('604fe53a2db226144e03770c', 'LA-AT IH (Police)', '{"dhis_id": "kgOEwygnRjE"}'::jsonb::jsonb);
    INSERT INTO public.data_service_entity
    (id, entity_code, config)
    VALUES('604fe53a2db226144e03770f', 'LA-BL IH (Police)', '{"dhis_id": "nVK4um8KmwG"}'::jsonb::jsonb);
    INSERT INTO public.data_service_entity
    (id, entity_code, config)
    VALUES('604fe53a2db226144e03771b', 'LA-OU IH (Police)', '{"dhis_id": "BxrxPkvmBkI"}'::jsonb::jsonb);
    INSERT INTO public.data_service_entity
    (id, entity_code, config)
    VALUES('604fe53a2db226144e03771e', 'LA-PH IH (Police)', '{"dhis_id": "GJwgCgpcSMs"}'::jsonb::jsonb);
    INSERT INTO public.data_service_entity
    (id, entity_code, config)
    VALUES('604fe53a2db226144e037721', 'LA-SL IH (Police)', '{"dhis_id": "SaF9mpwInVF"}'::jsonb::jsonb);
    INSERT INTO public.data_service_entity
    (id, entity_code, config)
    VALUES('604fe53a2db226144e037727', 'LA-VI IH (Police)', '{"dhis_id": "niZRRhMU6BB"}'::jsonb::jsonb);
    INSERT INTO public.data_service_entity
    (id, entity_code, config)
    VALUES('604fe53a2db226144e03772a', 'LA-XS IH (Police)', '{"dhis_id": "PnOH7yXRfeq"}'::jsonb::jsonb);
    
    
    INSERT INTO public.entity
    (id, code, parent_id, "name", "type", point, region, image_url, country_code, bounds, metadata, "attributes")
    VALUES('604fe53a2db226144e03770d', 'LA-AT IH (Police)', '5d3f884499a2e831bf2934b0', 'IH Attapu', 'facility'::entity_type::entity_type, NULL, NULL, NULL, 'LA', NULL, '{"dhis": {"push": false, "isDataRegional": true}}'::jsonb::jsonb, '{}'::jsonb::jsonb);
    INSERT INTO public.entity
    (id, code, parent_id, "name", "type", point, region, image_url, country_code, bounds, metadata, "attributes")
    VALUES('604fe53a2db226144e037710', 'LA-BL IH (Police)', '5d3f884439997831bfb29302', 'IH Bolikhamxai', 'facility'::entity_type::entity_type, NULL, NULL, NULL, 'LA', NULL, '{"dhis": {"push": false, "isDataRegional": true}}'::jsonb::jsonb, '{}'::jsonb::jsonb);
    INSERT INTO public.entity
    (id, code, parent_id, "name", "type", point, region, image_url, country_code, bounds, metadata, "attributes")
    VALUES('604fe53a2db226144e03771c', 'LA-OU IH (Police)', '5d3f8844ab9a0931bf103881', 'IH Oudomxai', 'facility'::entity_type::entity_type, NULL, NULL, NULL, 'LA', NULL, '{"dhis": {"push": false, "isDataRegional": true}}'::jsonb::jsonb, '{}'::jsonb::jsonb);
    INSERT INTO public.entity
    (id, code, parent_id, "name", "type", point, region, image_url, country_code, bounds, metadata, "attributes")
    VALUES('604fe53a2db226144e03771f', 'LA-PH IH (Police)', '5d3f8844a4ea9631bf63192e', 'IH Phongsali', 'facility'::entity_type::entity_type, NULL, NULL, NULL, 'LA', NULL, '{"dhis": {"push": false, "isDataRegional": true}}'::jsonb::jsonb, '{}'::jsonb::jsonb);
    INSERT INTO public.entity
    (id, code, parent_id, "name", "type", point, region, image_url, country_code, bounds, metadata, "attributes")
    VALUES('604fe53a2db226144e037722', 'LA-SL IH (Police)', '5d3f88445ea8e831bfadd003', 'IH Salavan', 'facility'::entity_type::entity_type, NULL, NULL, NULL, 'LA', NULL, '{"dhis": {"push": false, "isDataRegional": true}}'::jsonb::jsonb, '{}'::jsonb::jsonb);
    INSERT INTO public.entity
    (id, code, parent_id, "name", "type", point, region, image_url, country_code, bounds, metadata, "attributes")
    VALUES('604fe53a2db226144e037728', 'LA-VI IH (Police)', '5d3f88444f9f5e31bf1ab812', 'IH Vientiane', 'facility'::entity_type::entity_type, NULL, NULL, NULL, 'LA', NULL, '{"dhis": {"push": false, "isDataRegional": true}}'::jsonb::jsonb, '{}'::jsonb::jsonb);
    INSERT INTO public.entity
    (id, code, parent_id, "name", "type", point, region, image_url, country_code, bounds, metadata, "attributes")
    VALUES('604fe53a2db226144e03772b', 'LA-XS IH (Police)', '5d3f884474d66f31bfe708fb', 'IH Xaisomboun', 'facility'::entity_type::entity_type, NULL, NULL, NULL, 'LA', NULL, '{"dhis": {"push": false, "isDataRegional": true}}'::jsonb::jsonb, '{}'::jsonb::jsonb);
    
    
    INSERT INTO public.clinic
    (id, "name", country_id, geographical_area_id, code, "type", category_code, type_name)
    VALUES('604fe53a2db226144e03770b', 'IH Attapu', '5d09ac4bf013d63ce9170d88', '5d09ac4bf013d63ce9324956', 'LA-AT IH (Police)', '1', '1', 'Hospital');
    INSERT INTO public.clinic
    (id, "name", country_id, geographical_area_id, code, "type", category_code, type_name)
    VALUES('604fe53a2db226144e03770e', 'IH Bolikhamxai', '5d09ac4bf013d63ce9170d88', '5d09ac4bf013d63ce9298d19', 'LA-BL IH (Police)', '1', '1', 'Hospital');
    INSERT INTO public.clinic
    (id, "name", country_id, geographical_area_id, code, "type", category_code, type_name)
    VALUES('604fe53a2db226144e03771a', 'IH Oudomxai', '5d09ac4bf013d63ce9170d88', '5d09ac4bf013d63ce91c220b', 'LA-OU IH (Police)', '1', '1', 'Hospital');
    INSERT INTO public.clinic
    (id, "name", country_id, geographical_area_id, code, "type", category_code, type_name)
    VALUES('604fe53a2db226144e03771d', 'IH Phongsali', '5d09ac4bf013d63ce9170d88', '5d09ac4bf013d63ce9196286', 'LA-PH IH (Police)', '1', '1', 'Hospital');
    INSERT INTO public.clinic
    (id, "name", country_id, geographical_area_id, code, "type", category_code, type_name)
    VALUES('604fe53a2db226144e037720', 'IH Salavan', '5d09ac4bf013d63ce9170d88', '5d09ac4bf013d63ce92e9fb0', 'LA-SL IH (Police)', '1', '1', 'Hospital');
    INSERT INTO public.clinic
    (id, "name", country_id, geographical_area_id, code, "type", category_code, type_name)
    VALUES('604fe53a2db226144e037726', 'IH Vientiane', '5d09ac4bf013d63ce9170d88', '5d09ac4bf013d63ce928159a', 'LA-VI IH (Police)', '1', '1', 'Hospital');
    INSERT INTO public.clinic
    (id, "name", country_id, geographical_area_id, code, "type", category_code, type_name)
    VALUES('604fe53a2db226144e037729', 'IH Xaisomboun', '5d09ac4bf013d63ce9170d88', '5d09ac4bf013d63ce9342c4f', 'LA-XS IH (Police)', '1', '1', 'Hospital');

`);
};

exports._meta = {
  version: 1,
};
