import { NextFunction, Request, Response } from 'express';

export const PROJECT_ID_PARAM = 'projectId';

type Project = { id: string; code: string };
type ProjectRef = { id: string };
type Models = Request['models'];

type ProjectScopeRule = {
  filter: (project: Project) => Record<string, unknown>;
  ownership: (id: string, models: Models) => Promise<ProjectRef | null>;
  bodyOwnership?: (body: unknown, models: Models) => Promise<ProjectRef | null>;
};

const projectIdFromBody = (body: unknown): ProjectRef | null => {
  if (!body || typeof body !== 'object') return null;
  const projectId = (body as Record<string, unknown>).project_id;
  return typeof projectId === 'string' ? { id: projectId } : null;
};

const RULES: Record<string, ProjectScopeRule> = {
  surveys: {
    filter: project => ({ project_id: project.id }),
    ownership: async (id, models) => {
      const survey = await models.survey.findById(id);
      return survey?.project_id ? { id: survey.project_id } : null;
    },
    bodyOwnership: async body => projectIdFromBody(body),
  },
  entities: {
    filter: project => ({ project_id: project.id }),
    ownership: async (id, models) => {
      const entity = await models.entity.findById(id);
      const projectId = (entity as { project_id?: string } | undefined)?.project_id;
      return projectId ? { id: projectId } : null;
    },
    bodyOwnership: async body => projectIdFromBody(body),
  },
  projects: {
    // The single-project view shows only the active project as a single row.
    filter: project => ({ 'project.id': project.id }),
    // A project record's own id IS its project id.
    ownership: async id => ({ id }),
    // POST creates a new project — no parent project to validate against.
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
  const rewritten = `${url.pathname}${url.search}`;
  req.url = rewritten;
  req.originalUrl = rewritten;
};

const isMutationOnId = (method: string, segments: string[]) =>
  segments.length >= 2 && (method === 'PUT' || method === 'DELETE');

export const applyProjectScope = async (req: Request, res: Response, next: NextFunction) => {
  const host = req.headers.host ?? 'localhost';
  const url = new URL(req.originalUrl, `http://${host}`);
  const projectId = url.searchParams.get(PROJECT_ID_PARAM);
  const segments = splitPath(url.pathname);
  const resourceKey = segments[0] ?? '';
  const rule = RULES[resourceKey];

  // Always strip projectId before forwarding — central-server has no concept of it.
  url.searchParams.delete(PROJECT_ID_PARAM);

  if (!rule) {
    rewriteRequestUrl(req, url);
    return next();
  }

  if (!projectId) {
    res.status(400).json({ error: `Missing required query param: ${PROJECT_ID_PARAM}` });
    return undefined;
  }

  try {
    const project = await req.models.project.findOne({ id: projectId });
    if (!project) {
      res.status(400).json({ error: `Unknown project id: ${projectId}` });
      return undefined;
    }
    const projectCtx: Project = { id: project.id, code: project.code };

    if (req.method === 'GET') {
      const existingRaw = url.searchParams.get('filter');
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      // Caller-supplied filter wins on conflict so they can opt out per-request.
      const merged = { ...rule.filter(projectCtx), ...existing };
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
    } else if (req.method === 'POST' && rule.bodyOwnership) {
      const owner = await rule.bodyOwnership(req.body, req.models);
      if (owner && owner.id !== projectCtx.id) {
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
