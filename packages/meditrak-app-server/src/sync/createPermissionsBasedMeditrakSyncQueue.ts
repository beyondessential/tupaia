// Exact copy of: @tupaia/central-server/src/database/meditrakSyncQueue/createPermissionsBasedMeditrakSyncQueue.js
// TODO: Tidy this up as part of RN-502

import { SqlQuery, TupaiaDatabase } from '@tupaia/database';

const groupToArrayOrNull = (field: string) =>
  `NULLIF(array(select distinct unnest(array_agg(${field}))), '{NULL}')`;

const groupToFlatArrayOrNull = (field: string) =>
  `NULLIF(array(select distinct unnest(array_concat_agg(${field}))), '{}')`;

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
	max(e."type") AS entity_type,
	
	COALESCE(
		${groupToArrayOrNull('co.id')}, 
		${groupToArrayOrNull('e_co.id')}, 
		${groupToArrayOrNull('c.country_id')}, 
		${groupToArrayOrNull('ga.country_id')}, 
		${groupToFlatArrayOrNull('s.country_ids')},
		${groupToFlatArrayOrNull('sg_s.country_ids')},
		${groupToFlatArrayOrNull('ss_s.country_ids')},
		${groupToFlatArrayOrNull('ssc_ss_s.country_ids')},
		${groupToFlatArrayOrNull('q_ssc_ss_s.country_ids')},
		${groupToFlatArrayOrNull('os_q_ssc_ss_s.country_ids')},
		${groupToFlatArrayOrNull('o_os_q_ssc_ss_s.country_ids')}
	) as country_ids,

	COALESCE(
		${groupToArrayOrNull('pg."name"')},
		${groupToArrayOrNull('s_pg."name"')},
		${groupToArrayOrNull('sg_s_pg."name"')},
		${groupToArrayOrNull('ss_s_pg."name"')},
		${groupToArrayOrNull('ssc_ss_s_pg."name"')},
		${groupToArrayOrNull('q_ssc_ss_s_pg."name"')},
		${groupToArrayOrNull('os_q_ssc_ss_s_pg."name"')},
		${groupToArrayOrNull('o_os_q_ssc_ss_s_pg."name"')}
	) as permission_groups
FROM meditrak_sync_queue msq 
LEFT JOIN country co ON msq.record_id = co.id
LEFT JOIN entity e ON msq.record_id = e.id
LEFT JOIN country e_co ON e_co.code = e.country_code 
LEFT JOIN clinic c ON msq.record_id = c.id
LEFT JOIN geographical_area ga ON msq.record_id = ga.id
LEFT JOIN permission_group pg ON msq.record_id = pg.id
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

export const createPermissionsBasedMeditrakSyncQueue = async (database: TupaiaDatabase) => {
  return query.executeOnDatabase(database);
};
