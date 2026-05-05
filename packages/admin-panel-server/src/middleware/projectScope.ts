import { NextFunction, Request, Response } from 'express';
import winston from 'winston';

export const PROJECT_ID_PARAM = 'projectId';

type ProjectFilterBuilder = (project: { id: string; code: string }) => Record<string, unknown>;

const PROJECT_FILTERS: Record<string, ProjectFilterBuilder> = {
  surveys: project => ({ project_id: project.id }),
  entities: project => ({ project_id: project.id }),
  // The projects resource in the single-project section is scoped to the
  // active project itself so the table shows just that one editable row.
  projects: project => ({ 'project.id': project.id }),
  // surveyResponses → joins through survey; needs central-server support
  // dashboards / dashboardItems / dashboardRelations: project_codes (TEXT[]) — needs array filter
  // mapOverlays / mapOverlayGroups / mapOverlayGroupRelations: TBD
  // legacyReports: TBD
};

const extractResourceKey = (path: string): string | null => {
  const stripped = path.replace(/^\/v\d+\//, '/').replace(/^\/+/, '');
  const segment = stripped.split(/[/?]/)[0];
  return segment || null;
};

export const applyProjectScope = async (req: Request, _res: Response, next: NextFunction) => {
  const host = req.headers.host ?? 'localhost';
  const url = new URL(req.originalUrl, `http://${host}`);
  const projectId = url.searchParams.get(PROJECT_ID_PARAM);
  if (!projectId) {
    return next();
  }
  url.searchParams.delete(PROJECT_ID_PARAM);
  try {
    const project = await req.models.project.findOne({ id: projectId });
    if (!project) {
      winston.warn(`Unknown project id in ${PROJECT_ID_PARAM} param: ${projectId}`);
    } else if (req.method === 'GET') {
      // Only scope read endpoints. Create/update endpoints that need project
      // context can be handled per-route as we audit them.
      const builder = PROJECT_FILTERS[extractResourceKey(url.pathname) ?? ''];
      if (builder) {
        const existingRaw = url.searchParams.get('filter');
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        // Caller-supplied filter wins on conflict so they can opt out per-request.
        const merged = { ...builder({ id: project.id, code: project.code }), ...existing };
        url.searchParams.set('filter', JSON.stringify(merged));
      }
    }
    // Both req.url AND req.originalUrl need to be rewritten: http-proxy-middleware
    const rewritten = `${url.pathname}${url.search}`;
    req.url = rewritten;
    req.originalUrl = rewritten;
    return next();
  } catch (error) {
    return next(error);
  }
};
