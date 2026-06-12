/**
 * @typedef {import('@tupaia/types').Project} Project
 */

import { EntityTypeEnum } from '@tupaia/types';

/**
 * A project's root node is no longer a stored `type = 'project'` entity. It is
 * synthesized from the project record: its `id` IS the project id, which the
 * hierarchy edges (`project_country`) and the closure cache use as the ancestor
 * of the project's countries.
 *
 * @param {Pick<Project, 'id' | 'code' | 'name' | 'image_url'>} project
 */
export const buildProjectRootEntityFields = project => ({
  id: project.id,
  code: project.code,
  name: project.name,
  type: EntityTypeEnum.project,
  parent_id: null,
  country_code: null,
  image_url: project.image_url ?? null,
});
