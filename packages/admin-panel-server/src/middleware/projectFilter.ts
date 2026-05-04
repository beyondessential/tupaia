import { NextFunction, Request, Response } from 'express';
import winston from 'winston';

/**
 * Builds a partial filter object to be merged with the existing `filter`
 * query param sent to central-server. Returning `null` skips filtering for
 * that resource even when a project context is present.
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

const getReqUrl = (req: Request): URL => {
  const host = req.headers.host ?? 'localhost';
  return new URL(req.url, `http://${host}`);
};

/**
 * If a project is in context AND the requested resource has a registered
 * filter, merge the project filter into the URL's `filter` query param so
 * the proxied request to central-server returns project-scoped data.
 */
export const applyProjectFilter = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const project = req.ctx?.project;
    if (!project) {
      return next();
    }
    if (req.method !== 'GET') {
      // For now only scope read endpoints. Create/update endpoints that need
      // project context can be handled per-route as we audit them.
      return next();
    }
    const resourceKey = extractResourceKey(req.path);
    if (!resourceKey) {
      return next();
    }
    const builder = PROJECT_FILTERS[resourceKey];
    if (!builder) {
      return next();
    }

    const url = getReqUrl(req);
    const existingRaw = url.searchParams.get('filter');
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    // Caller-supplied filter wins on conflict so they can opt out per-request.
    const merged = { ...builder(project), ...existing };
    url.searchParams.set('filter', JSON.stringify(merged));
    req.url = `${url.pathname}${url.search}`;
    return next();
  } catch (error) {
    winston.warn(`applyProjectFilter failed: ${(error as Error).message}`);
    return next();
  }
};
