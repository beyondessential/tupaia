import { Project } from '@tupaia/types';
import { NotFoundError } from '@tupaia/utils';

/**
 * Fetches a project by its ID from webConfig server
 * @param ctx
 * @param projectId
 */
export const getProjectById = async (req: any, projectId: Project['id']) => {
  const project = await req.models.project.findOne({ id: projectId }, { columns: ['code'] });
  if (project === null) {
    throw new NotFoundError(`No project found with ID ${projectId}`);
  }

  const { id, name, code, homeEntityCode, dashboardGroupName, defaultMeasure } =
    await req.ctx.services.webConfig.fetchProject(project.code, {
      showExcludedProjects: false,
    });

  return {
    id,
    name,
    code,
    homeEntityCode,
    dashboardGroupName,
    defaultMeasure,
  };
};
