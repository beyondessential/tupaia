import { NextFunction, Request, Response } from 'express';
import winston from 'winston';

export const PROJECT_ID_PARAM = 'projectId';

/**
 * Builds a partial filter object to be merged with the existing `filter`
 * query param sent to central-server.
 */
type ProjectFilterBuilder = (project: { id: string; code: string }) => Record<string, unknown>;

/**
 * Registry of resource → project filter builder. Keys are matched against the
 * first path segment of the proxied URL (e.g. /v1/surveys/123 → "surveys").
 *
 * TODO(TUP-3055/RN-1876): expand for the remaining single-project resources.
 * Many require central-server-side join support (e.g. surveyResponses → survey
 * → project_id) which doesn't always work via the simple JSON filter format,
 * so they need either custom join hints in the central-server GET handler or
 * a different filtering mechanism.
 */
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

const applyResourceFilter = (url: URL, project: { id: string; code: string }) => {
  const resourceKey = extractResourceKey(url.pathname);
  if (!resourceKey) return;
  const builder = PROJECT_FILTERS[resourceKey];
  if (!builder) return;
  const existingRaw = url.searchParams.get('filter');
  const existing = existingRaw ? JSON.parse(existingRaw) : {};
  // Caller-supplied filter wins on conflict so they can opt out per-request.
  const merged = { ...builder(project), ...existing };
  url.searchParams.set('filter', JSON.stringify(merged));
};

// Both req.url AND req.originalUrl need to be rewritten: http-proxy-middleware
// v2 resets `req.url = req.originalUrl` before forwarding (see
// node_modules/http-proxy-middleware/dist/http-proxy-middleware.js:90), so a
// req.url-only mutation is clobbered.
const setRequestUrl = (req: Request, rewritten: string) => {
  req.url = rewritten;
  req.originalUrl = rewritten;
};

/**
 * Reads the `projectId` query param sent by the admin panel and scopes the
 * request to that project: looks the project up, attaches it to req.ctx so
 * downstream routes can use it, strips the param from the URL (central-server
 * has no concept of it), and merges the per-resource project filter into the
 * URL's `filter` query param for proxied GET requests.
 */
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
      setRequestUrl(req, `${url.pathname}${url.search}`);
      return next();
    }
    const projectCtx = { id: project.id, code: project.code };
    req.ctx.project = projectCtx;
    if (req.method === 'GET') {
      // Only scope read endpoints. Create/update endpoints that need project
      // context can be handled per-route as we audit them.
      applyResourceFilter(url, projectCtx);
    }
    setRequestUrl(req, `${url.pathname}${url.search}`);
    return next();
  } catch (error) {
    return next(error);
  }
};
