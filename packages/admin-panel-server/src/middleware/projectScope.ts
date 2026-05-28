import { NextFunction, Request, Response } from 'express';

export const PROJECT_CODE_PARAM = 'projectCode';

type Project = { id: string; code: string };
type ProjectRef = { id: string };
type Models = Request['models'];

type ProjectScopeRule = {
  filter: (project: Project) => Record<string, unknown>;
  ownership: (id: string, models: Models) => Promise<ProjectRef | null>;
  // Required so a new rule can't silently bypass POST scope enforcement by
  // forgetting to define one.
  bodyOwnership: (body: unknown, models: Models) => Promise<ProjectRef | null>;
};

const projectIdFromBody = (body: unknown): ProjectRef | null => {
  if (!body || typeof body !== 'object') return null;
  const projectId = (body as Record<string, unknown>).project_id;
  return typeof projectId === 'string' ? { id: projectId } : null;
};

// Admin-panel forms post related records by code using dotted keys
// (e.g. `'project.code'`) — same convention `convertFieldsToIds` consumes
// on the central side. Resolve those to a project_id so the active-scope
// check can still run on the POST body.
const projectRefFromBody = async (
  body: unknown,
  models: Models,
): Promise<ProjectRef | null> => {
  const direct = projectIdFromBody(body);
  if (direct) return direct;
  if (!body || typeof body !== 'object') return null;
  const projectCode = (body as Record<string, unknown>)['project.code'];
  if (typeof projectCode !== 'string') return null;
  const project = await models.project.findOne({ code: projectCode });
  return project ? { id: project.id } : null;
};

const PROJECT_CODE_PASSTHROUGH_PATHS = new Set(['import/entities']);

const RULES: Record<string, ProjectScopeRule> = {
  surveys: {
    filter: project => ({ project_id: project.id }),
    ownership: async (id, models) => {
      const survey = await models.survey.findById(id);
      return survey?.project_id ? { id: survey.project_id } : null;
    },
    bodyOwnership: projectRefFromBody,
  },
  entities: {
    filter: project => ({ project_id: project.id }),
    ownership: async (id, models) => {
      const entity = await models.entity.findById(id);
      const projectId = (entity as { project_id?: string } | undefined)?.project_id;
      return projectId ? { id: projectId } : null;
    },
    bodyOwnership: projectRefFromBody,
  },
  surveyResponses: {
    filter: project => ({ 'survey.project_id': project.id }),
    ownership: async (id, models) => {
      const sr = await models.surveyResponse.findById(id);
      if (!sr?.survey_id) return null;
      const survey = await models.survey.findById(sr.survey_id);
      return survey?.project_id ? { id: survey.project_id } : null;
    },
    bodyOwnership: async (body, models) => {
      if (!body || typeof body !== 'object') return null;
      const surveyId = (body as Record<string, unknown>).survey_id;
      if (typeof surveyId !== 'string') return null;
      const survey = await models.survey.findById(surveyId);
      return survey?.project_id ? { id: survey.project_id } : null;
    },
  },
};

const splitPath = (path: string): string[] => {
  const stripped = path.replace(/^\/v\d+\//, '/').replace(/^\/+/, '');
  return stripped.split(/[/?]/).filter(Boolean);
};

const rewriteRequestUrl = (req: Request, url: URL) => {
  // Mutate req.url and req.originalUrl before forwarding. Without mutating originalUrl the merged project filter and
  // stripped projectCode param never reach central-server.
  const rewritten = `${url.pathname}${url.search}`;
  req.url = rewritten;
  req.originalUrl = rewritten;
};

const isMutationOnId = (method: string, segments: string[]) =>
  segments.length >= 2 && (method === 'PUT' || method === 'PATCH' || method === 'DELETE');

export const applyProjectScope = async (req: Request, res: Response, next: NextFunction) => {
  // Use a fixed base — we only read pathname/searchParams from the result, so
  // a client-supplied Host header has no role here.
  const url = new URL(req.originalUrl, 'http://localhost');
  const projectCode = url.searchParams.get(PROJECT_CODE_PARAM);
  const segments = splitPath(url.pathname);
  const resourceKey = segments[0] ?? '';
  const rule = RULES[resourceKey];

  // Strip projectCode before forwarding unless this is an endpoint that consumes it
  if (!PROJECT_CODE_PASSTHROUGH_PATHS.has(segments.join('/'))) {
    url.searchParams.delete(PROJECT_CODE_PARAM);
  }

  // No rule or no project context → forward unchanged. Absent projectCode is
  // an explicit "all-data" view; scoped resources see cross-project data.
  if (!rule || !projectCode) {
    rewriteRequestUrl(req, url);
    return next();
  }

  try {
    const project = await req.models.project.findOne({ code: projectCode });
    if (!project) {
      res.status(400).json({ error: `Unknown project code: ${projectCode}` });
      return undefined;
    }
    const projectCtx: Project = { id: project.id, code: project.code };

    if (req.method === 'GET') {
      const existingRaw = url.searchParams.get('filter');
      let existing: Record<string, unknown> = {};
      if (existingRaw) {
        try {
          existing = JSON.parse(existingRaw);
        } catch {
          res.status(400).json({ error: 'Invalid filter JSON' });
          return undefined;
        }
      }
      // Scope filter wins on conflict — must be a hard boundary, not an
      // opt-out the caller can override by supplying their own project_id.
      const merged = { ...existing, ...rule.filter(projectCtx) };
      url.searchParams.set('filter', JSON.stringify(merged));
    } else if (isMutationOnId(req.method, segments)) {
      const id = segments[1];
      const owner = await rule.ownership(id, req.models);
      if (!owner) {
        res.status(404).json({ error: `${resourceKey}/${id} not found` });
        return undefined;
      }
      if (owner.id !== projectCtx.id) {
        res.status(403).json({
          error: `${resourceKey}/${id} does not belong to the active project`,
        });
        return undefined;
      }
    } else if (req.method === 'POST') {
      const owner = await rule.bodyOwnership(req.body, req.models);
      if (!owner) {
        res.status(400).json({
          error: `${resourceKey} body must reference a project in the active scope`,
        });
        return undefined;
      }
      if (owner.id !== projectCtx.id) {
        res.status(403).json({ error: `${resourceKey} body references a different project` });
        return undefined;
      }
    }

    rewriteRequestUrl(req, url);
    return next();
  } catch (error) {
    return next(error);
  }
};
