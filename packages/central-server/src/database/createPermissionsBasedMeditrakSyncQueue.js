/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { SqlQuery } from '@tupaia/database';

/**
 * Creates the permissions_based_meditrak_sync_queue Materialized View
 *
 * This is used to improve the speed of querying the meditrak_sync_queue when
 * doing a permissions based sync
 */
const query = new SqlQuery(`
DROP MATERIALIZED VIEW IF EXISTS permissions_based_meditrak_sync_queue;
CREATE MATERIALIZED VIEW permissions_based_meditrak_sync_queue AS 
SELECT msq.*, 
	max(e.country_code) AS entity_country, 
	max(e."type") AS entity_type, 
	max(c_co.code) AS clinic_country, 
	max(ga_co.code) AS geographical_area_country, 
	NULLIF(array(select distinct unnest(array_agg(s_pg."name"))), '{NULL}') AS survey_permissions, 
	NULLIF(array(select distinct unnest(array_concat_agg(s.country_ids))), '{}') AS survey_countries, 
	NULLIF(array(select distinct unnest(array_agg(sg_s_pg."name"))), '{NULL}') AS survey_group_permissions, 
	NULLIF(array(select distinct unnest(array_concat_agg(sg_s.country_ids))), '{}') AS survey_group_countries,
	NULLIF(array(select distinct unnest(array_agg(ss_s_pg."name"))), '{NULL}') AS survey_screen_permissions, 
	NULLIF(array(select distinct unnest(array_concat_agg(ss_s.country_ids))), '{}') AS survey_screen_countries, 
	NULLIF(array(select distinct unnest(array_agg(ssc_ss_s_pg."name"))), '{NULL}') AS survey_screen_component_permissions, 
	NULLIF(array(select distinct unnest(array_concat_agg(ssc_ss_s.country_ids))), '{}') AS survey_screen_component_countries, 
	NULLIF(array(select distinct unnest(array_agg(q_ssc_ss_s_pg."name"))), '{NULL}') AS question_permissions, 
	NULLIF(array(select distinct unnest(array_concat_agg(q_ssc_ss_s.country_ids))), '{}') AS question_countries, 
	NULLIF(array(select distinct unnest(array_agg(os_q_ssc_ss_s_pg."name"))), '{NULL}') AS option_set_permissions, 
	NULLIF(array(select distinct unnest(array_concat_agg(os_q_ssc_ss_s.country_ids))), '{}') AS option_set_countries, 
	NULLIF(array(select distinct unnest(array_agg(o_os_q_ssc_ss_s_pg."name"))), '{NULL}') AS option_permissions, 
	NULLIF(array(select distinct unnest(array_concat_agg(o_os_q_ssc_ss_s.country_ids))), '{}') AS option_countries
FROM meditrak_sync_queue msq 
LEFT JOIN entity e ON msq.record_id = e.id
LEFT JOIN clinic c ON msq.record_id = c.id
LEFT JOIN country c_co ON c.country_id = c_co.id 
LEFT JOIN geographical_area ga ON msq.record_id = ga.id 
LEFT JOIN country ga_co ON ga.country_id = ga_co.id 
LEFT JOIN survey s ON msq.record_id = s.id 
LEFT JOIN permission_group s_pg ON s.permission_group_id = s_pg.id 
LEFT JOIN survey_group sg ON msq.record_id = sg.id
LEFT JOIN survey sg_s ON sg_s.survey_group_id = sg.id 
LEFT JOIN permission_group sg_s_pg ON sg_s.permission_group_id = sg_s_pg.id  
LEFT JOIN survey_screen ss ON msq.record_id = ss.id
LEFT JOIN survey ss_s ON ss.survey_id  = ss_s.id 
LEFT JOIN permission_group ss_s_pg ON ss_s.permission_group_id = ss_s_pg.id 
LEFT JOIN survey_screen_component ssc ON msq.record_id = ssc.id
LEFT JOIN survey_screen ssc_ss ON ssc.screen_id = ssc_ss.id
LEFT JOIN survey ssc_ss_s ON ssc_ss.survey_id  = ssc_ss_s.id 
LEFT JOIN permission_group ssc_ss_s_pg ON ssc_ss_s.permission_group_id = ssc_ss_s_pg.id 
LEFT JOIN question q ON msq.record_id = q.id
LEFT JOIN survey_screen_component q_ssc ON q_ssc.question_id = q.id
LEFT JOIN survey_screen q_ssc_ss ON q_ssc.screen_id = q_ssc_ss.id
LEFT JOIN survey q_ssc_ss_s ON q_ssc_ss.survey_id  = q_ssc_ss_s.id 
LEFT JOIN permission_group q_ssc_ss_s_pg ON q_ssc_ss_s.permission_group_id = q_ssc_ss_s_pg.id 
LEFT JOIN option_set os ON msq.record_id = os.id 
LEFT JOIN question os_q ON os_q.option_set_id = os.id
LEFT JOIN survey_screen_component os_q_ssc ON os_q_ssc.question_id = os_q.id
LEFT JOIN survey_screen os_q_ssc_ss ON os_q_ssc.screen_id = os_q_ssc_ss.id
LEFT JOIN survey os_q_ssc_ss_s ON os_q_ssc_ss.survey_id  = os_q_ssc_ss_s.id 
LEFT JOIN permission_group os_q_ssc_ss_s_pg ON os_q_ssc_ss_s.permission_group_id = os_q_ssc_ss_s_pg.id 
LEFT JOIN "option" o ON msq.record_id = o.id
LEFT JOIN option_set o_os ON o.option_set_id = o_os.id 
LEFT JOIN question o_os_q ON o_os_q.option_set_id = o_os.id
LEFT JOIN survey_screen_component o_os_q_ssc ON o_os_q_ssc.question_id = o_os_q.id
LEFT JOIN survey_screen o_os_q_ssc_ss ON o_os_q_ssc.screen_id = o_os_q_ssc_ss.id
LEFT JOIN survey o_os_q_ssc_ss_s ON o_os_q_ssc_ss.survey_id  = o_os_q_ssc_ss_s.id 
LEFT JOIN permission_group o_os_q_ssc_ss_s_pg ON o_os_q_ssc_ss_s.permission_group_id = o_os_q_ssc_ss_s_pg.id
GROUP BY msq.id;
CREATE UNIQUE INDEX permissions_based_meditrak_sync_queue_id_idx ON permissions_based_meditrak_sync_queue (id); 
`);

export const createPermissionsBasedMeditrakSyncQueue = async database => {
  return query.executeOnDatabase(database);
};
